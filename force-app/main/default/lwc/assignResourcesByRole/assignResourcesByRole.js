import { api, LightningElement, wire } from 'lwc';
import { getSObjectValue } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
// import { updateRecord } from 'lightning/uiRecordApi';

import getProjectRolesRequired from '@salesforce/apex/ProjectData.getProjectRolesRequired';
import getAssignedResources from '@salesforce/apex/ProjectData.getAssignedResources';
import getUsersAvailableForProject from '@salesforce/apex/ProjectData.getUsersAvailableForProject';
import insertUsersToProject from '@salesforce/apex/ProjectData.insertUsersToProject';

import PROJECT_START_DATE from '@salesforce/schema/Project__c.Start_Date__c'
import PROJECT_END_DATE from '@salesforce/schema/Project__c.End_Date__c'

export default class AssignResourcesByRole extends LightningElement {
    @api recordId;

    projectStartDate;
    projectEndDate;

    wireResourcesAvailable;

    templProjectRolesRequired;
    usersAvailableForProject;

    // updateRecord({ fields: { Id: this.recordId } });

    @wire(getProjectRolesRequired, { projectId: '$recordId' })
    projectRolesRequired;

    @wire(getAssignedResources, { projectId: '$recordId' })
    projectAssignedResources;

    get templProjectStartDate() {
        let retStartDate = '';
        if (this.projectRolesRequired.data) {
            console.log('this.projectRolesRequired.data');
            console.log(this.projectRolesRequired.data);
            retStartDate = getSObjectValue(this.projectRolesRequired.data[0], PROJECT_START_DATE);
            this.projectStartDate = retStartDate;
            this.projectEndDate = getSObjectValue(this.projectRolesRequired.data[0], PROJECT_END_DATE);
            console.log(retStartDate);
        }
        return retStartDate;
    }

    @wire(getUsersAvailableForProject, { startDate: '$projectStartDate', endDate: '$projectEndDate', roleList: ['Squad lead', 'Consultant', 'Architect', 'Developer']  }) // Date.parse("Aug 9, 1995") Date.parse("Aug 15, 1995")
    resourcesAvailable(result) { // { error, data }) {
        this.wireResourcesAvailable = result;
        if (result.data) {
            this.usersAvailableForProject = result.data;
            this.error = undefined;
            console.log(this.usersAvailableForProject);

            this.templProjectRolesRequired = JSON.parse(JSON.stringify(this.projectRolesRequired.data));// [0]
            console.log('this.templProjectRolesRequired before');
            console.log(this.templProjectRolesRequired);
            if (this.templProjectRolesRequired[0].Roles__r.length > 0) {
                console.log(this.templProjectRolesRequired[0].Roles__r);
                for (let rr = 0; rr < this.templProjectRolesRequired[0].Roles__r.length; rr++) {
                    // add property 'UsersAvailable' to actual Roles_r (Role required)
                    this.templProjectRolesRequired[0].Roles__r[rr]['UsersAvailable'] = [];
                    for (let ua = 0; ua < this.usersAvailableForProject.length; ua++) {
                        if (this.templProjectRolesRequired[0].Roles__r[rr].Role__c 
                            == this.usersAvailableForProject[ua].UserRole.Name) {
                            console.log(this.usersAvailableForProject[ua]);
                            this.templProjectRolesRequired[0].Roles__r[rr]['UsersAvailable'].push(
                                JSON.parse(JSON.stringify(this.usersAvailableForProject[ua]))
                            );
                        }
                    }
                }
            }
            console.log('this.templProjectRolesRequired after');
            console.log(this.templProjectRolesRequired);

        } else if (result.error) {
            this.error = result.error;
            this.usersAvailableForProject = undefined;
        }
    }

    renderedCallback() {
        if (this.projectRolesRequired.data) {
            console.log('this.projectRolesRequired.data');
            console.log(this.projectRolesRequired.data);
            this.projectStartDate = getSObjectValue(this.projectRolesRequired.data[0], PROJECT_START_DATE);
            this.projectEndDate = getSObjectValue(this.projectRolesRequired.data[0], PROJECT_END_DATE);
            console.log(this.projectStartDate);
        }

        if (this.projectAssignedResources.data) {
            console.log('this.projectAssignedResources.data');
            console.log(this.projectAssignedResources.data);
        }
    }

    bDateInBusinessDay(dateValue) {
        const d = new Date(dateValue);
        let dayOfTheWeek = d.getDay();
        console.log(dayOfTheWeek);
        return !(dayOfTheWeek==0 || dayOfTheWeek==6);
    }

    bDateBetweenProjectDates(dateValue) {
        const dateIn = new Date(dateValue);
        const projStart = new Date(this.projectStartDate);
        const projEnd = new Date(this.projectEndDate);
        return ((dateIn.getTime() >= projStart.getTime()) && (dateIn.getTime() <= projEnd.getTime()))
    }

    getBusinessHoursBetweenTwoDates(d0, d1) {
        var stDate = new Date(d0); // Date.parse(d0);
        var enDate = new Date(d1); // Date.parse(d1);
        // Validate input
        if (enDate < stDate)
            return 0;
    
        // Calculate days between dates
        var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
        stDate.setHours(0,0,0,1);  // Start just after midnight
        enDate.setHours(23,59,59,999);  // End just before midnight
        var diff = enDate - stDate;  // Milliseconds between datetime objects    
        var days = Math.ceil(diff / millisecondsPerDay);
    
        // Subtract two weekend days for every week in between
        var weeks = Math.floor(days / 7);
        days = days - (weeks * 2);
    
        // Handle special cases
        var startDayW = stDate.getDay();
        var endDayW = enDate.getDay();
    
        // Remove weekend not previously removed.   
        if (startDayW - endDayW > 1)         
            days = days - 2;      
    
        // Remove start day if span starts on Sunday but ends before Saturday
        if (startDayW == 0 && endDayW != 6)
            days = days - 1  
    
        // Remove end day if span ends on Saturday but starts after Sunday
        if (endDayW == 6 && startDayW != 0)
            days = days - 1  
    
        // console.log('days'); console.log(days);
        return days;
    }

    setElementValueByIdName(id, strName, value) {
        [...this.template.querySelectorAll('lightning-input')]
        .filter(element => (element.dataset.id == id) && (element.name == strName))
        .map(element => { element.value = value; });
    }

    handleChangeDate(event) {
        console.log(event.target.dataset.id);
        console.log(event.target.name); // console.log(event.target.value);

        // get event data
        let resourceId = event.target.dataset.id;
        let field = event.target.name;
        let dateValue = event.target.value;

        // declare auxiliar variables
        let alerts = [];

        let startDate;
        let endDate;
        let hours;

        // validate correct StarDate and EndDate in a business day.
        if( ! (this.bDateInBusinessDay(dateValue))) {
            console.log('The Date must be put in business days...');
            alerts.push('The Date must be put in business days.');
        }

        // validate correct StarDate and EndDate between Project Dates.
        if ( ! (this.bDateBetweenProjectDates(dateValue))) {
            alerts.push('Date must be set between Project Start and End Date.'); 
        }

        // get EndDate
        if(field == 'start-date') {
            startDate = dateValue;
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == resourceId) && (element.name == 'end-date'))
            .map(element => { console.log(element.value); endDate = element.value; });
            // console.log(startDate); // console.log(endDate);
        }

        // get StartDate
        if(field == 'end-date') {
            endDate = dateValue;
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == resourceId) && (element.name == 'start-date'))
            .map(element => { console.log(element.value); startDate = element.value; });
            // console.log(startDate); // console.log(endDate);
        }

        // validate correct StarDate and EndDate.
        if(startDate && endDate) {
            console.log(startDate);
            console.log(endDate);

            const dateStart = new Date(startDate);
            const dateEnd = new Date(endDate);

            if(dateStart.getTime() > dateEnd.getTime()) {
                alerts.push('Start Date must be minor or equal than the End Date.');
            }
        }

        // show alert
        if(alerts.length > 0) { // slds-has-error
            let alertMessages = ''
            for (let i = 0; i < alerts.length; i++) {
                alertMessages += alerts[i];
                if(i<alerts.length) alertMessages += "\n";
            }
            event.target.classList.add('slds-has-error');
            alert(alertMessages);
            event.target.value = '';
            return false;
        }
        event.target.classList.remove('slds-has-error');

        // calculate business hours
        if(startDate && endDate) {
            let daysBetweenDates = this.getBusinessHoursBetweenTwoDates(startDate, endDate);

            this.setElementValueByIdName(resourceId, 'hours', daysBetweenDates*8);

            console.log('daysBetween');
            console.log(daysBetweenDates);
        }

    }


    handleInsertSelectedResources(event) {
        console.log('event.detail' + event.detail);
        let checkboxsSelected = [...this.template.querySelectorAll('lightning-input')]
            .filter(element => element.checked)
            .map(element => [element.dataset.id, element.dataset.role]);
        console.log(checkboxsSelected);

        checkboxsSelected.forEach((userIdRoleArr, idx) => {
            console.log(idx);
            console.log(userIdRoleArr);

            // assign values (StarDate, EndDate and Hours) to checkboxsSelected list
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == userIdRoleArr[0]) && (element.name == 'start-date')) // idx
            .map(element => {
                console.log(element.value);
                checkboxsSelected[idx].push(element.value);
            });
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == userIdRoleArr[0]) && (element.name == 'end-date')) // idx
            .map(element => {
                console.log(element.value);
                checkboxsSelected[idx].push(element.value);
            });
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == userIdRoleArr[0]) && (element.name == 'hours')) // idx
            .map(element => {
                console.log(element.value);
                checkboxsSelected[idx].push(element.value);
            });
        })
        console.log(checkboxsSelected);

        if (checkboxsSelected.length > 0) {
            insertUsersToProject({projectId: this.recordId, startDate: this.projectStartDate, endDate: this.projectEndDate, usersId: checkboxsSelected})
            .then((result) => {
                this.handleSuccess();
                this.result = result;
                // clean the form with apex refresh
                refreshApex(this.wireResourcesAvailable);
                // updateRecord({ fields: { Id: this.recordId } });
                console.log('RESULT:');
                console.log(result);
            })
            .catch((error) => {
                this.error = error;
                console.log(error);
            })

        }
        console.log(checkboxsSelected);

    }

    handleSuccess() {
        this.dispatchEvent( new ShowToastEvent({
            title: 'Users Assigned!',
            message: '',
            variant: 'success'
        }));
    }

    handleSubmit(event) {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        console.log('fields');
        console.log(fields);
        // this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleClick() {
        console.log('this.projectRolesRequired');
        console.log(this.recordId);
        console.log(this.projectRolesRequired);
        console.log(this.projectRolesRequired.data[0].Name);
        console.log('this.usersAvailableForProject');
        console.log(this.usersAvailableForProject);
        /*
        getProjectRolesRequired({ projectId: '$recordId' })
            .then((result) => {
                this.projectRolesRequired = result;
                console.log('this.projectRolesRequired');
                console.log(this.recordId);
                console.log(this.projectRolesRequired);
            })
            .catch((error) => {
                this.projectRolesRequired = undefined;
                console.log('this.projectRolesRequired error');
                console.log(this.recordId);
                console.log(this.projectRolesRequired);
            })
        */
    }


    /*
    handleDateFocusOut(event) {
        if( ! (event.target.value)) {
            event.target.classList.remove('slds-has-error');
        }
    }
    */

}