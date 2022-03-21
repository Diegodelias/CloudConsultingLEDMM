import { api, LightningElement, wire } from 'lwc';
import { getSObjectValue } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord, getRecordNotifyChange } from 'lightning/uiRecordApi';
// import { updateRecord } from 'lightning/uiRecordApi';

import getProjectRolesRequired from '@salesforce/apex/ProjectDataService.getProjectRolesRequired';
import getAssignedResources from '@salesforce/apex/ProjectDataService.getAssignedResources';
import getUsersAvailableForProject from '@salesforce/apex/ProjectDataService.getUsersAvailableForProject';
import insertResourcesToProject from '@salesforce/apex/ProjectDataService.insertResourcesToProject';

import PROJECT_START_DATE from '@salesforce/schema/Project__c.Start_Date__c'
import PROJECT_END_DATE from '@salesforce/schema/Project__c.End_Date__c'

const AssignedResourcesDataColumns = [
    { label: 'User',        fieldName: 'User__r.Name',      type: 'string'},
    { label: 'Role',        fieldName: 'Role__c',           type: 'string' },
    { label: 'Start Date',  fieldName: 'Start_Date__c',     type: 'date' },
    { label: 'End Date',    fieldName: 'End_Date__c',       type: 'date' },
    { label: 'Hours',       fieldName: 'Hours__c',          type: 'number' },
];

export default class AssignResourcesByRole extends LightningElement {
    @api recordId;

    projectStartDate;
    projectEndDate;
    projectRequiredRolesList;

    isLoading = true;

    assignedResourcesDataColumns = AssignedResourcesDataColumns;

    wireProjectRolesRequired;
    wireProjectAssignedResources;
    wireResourcesAvailable;

    templProjectRolesRequired;
    projectRolesRequired;
    projectAssignedResources;
    usersAvailableForProject;

    // updateRecord({ fields: { Id: this.recordId } });


    renderedCallback() {
        if (this.projectRolesRequired) { // .data
            console.log('this.projectRolesRequired'); console.log(this.projectRolesRequired); // .data .data
            this.projectStartDate = getSObjectValue(this.projectRolesRequired[0], PROJECT_START_DATE); // .data
            this.projectEndDate = getSObjectValue(this.projectRolesRequired[0], PROJECT_END_DATE); // .data
            console.log(this.projectStartDate); console.log(this.projectEndDate);

            console.log(this.projectRequiredRolesList);
            if( ! this.projectRequiredRolesList) {
                this.projectRequiredRolesList = [];
                this.projectRolesRequired.forEach(roleReqRecord => { // .data
                    roleReqRecord.Roles__r.forEach(role => {
                        this.projectRequiredRolesList.push(role.Role__c);
                    });
                });
                console.log(this.projectRequiredRolesList);
            }
        }

    }


    @wire(getProjectRolesRequired, { projectId: '$recordId' })
    wireGetProjectRolesRequired(result) {
        this.isLoading = true;
        this.wireProjectRolesRequired = result;
        if(result.data) {
            this.projectRolesRequired = result.data;
            console.log('this.projectRolesRequired wire');
            console.log(this.projectRolesRequired);
            this.error = undefined;
            // refreshApex(this.wireProjectAssignedResources);
            this.getProjectAssignedResources();
        } else if(result.error) {
            this.error = result.error;
            this.projectRolesRequired = undefined;
        }
    }


    /*
    @wire(getAssignedResources, { projectId: '$recordId' }) // projectAssignedResources
    wireGetProjectAssignedResources(result) {
        this.wireProjectAssignedResources = result;
        if(result.data) {
            this.projectAssignedResources = result.data;
            console.log('this.projectAssignedResources wire');
            console.log(this.projectAssignedResources);
            this.error = undefined;
            refreshApex(this.wireResourcesAvailable);
        } else if(result.error) {
            this.error = result.error;
            this.projectAssignedResources = undefined;
        }
    }
    */


    getProjectAssignedResources() {
        getAssignedResources({ projectId: this.recordId }) // projectAssignedResources
        .then((result) => {
            this.wireProjectAssignedResources = result;
            this.projectAssignedResources = result;
            console.log('this.projectAssignedResources wire');
            console.log(this.projectAssignedResources);
            this.error = undefined;
            // refreshApex(this.wireResourcesAvailable);
            this.getProjectUsersAvailable();
        })
        .catch((error) => {
            this.error = error;
            this.projectAssignedResources = undefined;
        })
    }


    /*
    @wire(getUsersAvailableForProject, { startDate: '$projectStartDate', endDate: '$projectEndDate', roleList: '$projectRequiredRolesList' }) // '$projectRequiredRolesList' ['Squad lead', 'Consultant', 'Architect', 'Developer']
    resourcesAvailable(result) { // { error, data }) {
        this.wireResourcesAvailable = result;
        if (result.data) {
            this.usersAvailableForProject = result.data;
            this.error = undefined;
            console.log(this.projectAssignedResources); // .data
            console.log(this.usersAvailableForProject);

            this.templProjectRolesRequired = JSON.parse(JSON.stringify(this.projectRolesRequired));// [0] .data
            console.log('this.templProjectRolesRequired before');
            console.log(this.templProjectRolesRequired);
            if (this.templProjectRolesRequired[0].Roles__r.length > 0) {
                console.log(this.templProjectRolesRequired[0].Roles__r);
                for (let rr = 0; rr < this.templProjectRolesRequired[0].Roles__r.length; rr++) {

                    // add accordion label
                    this.templProjectRolesRequired[0].Roles__r[rr]['AccordionLabel'] = 'Resources available to assign for "' + 
                        this.templProjectRolesRequired[0].Roles__r[rr].Role__c + '" role.';

                    // add boolean to show Accordion only if Hours Required are not covered
                    this.templProjectRolesRequired[0].Roles__r[rr]['BoolShowAccordion'] = (
                        this.templProjectRolesRequired[0].Roles__r[rr].Hours_Covered__c < this.templProjectRolesRequired[0].Roles__r[rr].Hours_Required__c
                    );

                    // add property 'AssignedResources' to actual Roles_r (Role required)
                    this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'] = false;
                    for (let ar = 0; ar < this.projectAssignedResources.length; ar++) { // .data
                        if (this.templProjectRolesRequired[0].Roles__r[rr].Role__c 
                            == this.projectAssignedResources[ar].Role__c) { // .data
                            console.log(this.projectAssignedResources[ar]); // .data
                            if(this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'] === false) {
                                this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'] = [];
                            }
                            this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'].push(
                                JSON.parse(JSON.stringify(this.projectAssignedResources[ar])) // .data
                            );
                        }
                    }

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

        this.isLoading = false;
    }
    */


    getProjectUsersAvailable() {
        getUsersAvailableForProject( { startDate: this.projectStartDate, endDate: this.projectEndDate, roleList: this.projectRequiredRolesList })
        .then((result) => {
            this.wireResourcesAvailable = result;
            this.usersAvailableForProject = result;
            this.error = undefined;
            console.log(this.projectAssignedResources);
            console.log(this.usersAvailableForProject);

            this.templProjectRolesRequired = JSON.parse(JSON.stringify(this.projectRolesRequired));
            console.log('this.templProjectRolesRequired before');
            console.log(this.templProjectRolesRequired);
            if (this.templProjectRolesRequired[0].Roles__r.length > 0) {
                console.log(this.templProjectRolesRequired[0].Roles__r);
                for (let rr = 0; rr < this.templProjectRolesRequired[0].Roles__r.length; rr++) {

                    // add accordion label
                    this.templProjectRolesRequired[0].Roles__r[rr]['AccordionLabel'] = 'Resources available to assign for "' + 
                        this.templProjectRolesRequired[0].Roles__r[rr].Role__c + '" role.';

                    // add boolean to show Accordion only if Hours Required are not covered
                    this.templProjectRolesRequired[0].Roles__r[rr]['BoolShowAccordion'] = (
                        this.templProjectRolesRequired[0].Roles__r[rr].Hours_Covered__c < this.templProjectRolesRequired[0].Roles__r[rr].Hours_Required__c
                    );

                    // add property 'AssignedResources' to actual Roles_r (Role required)
                    this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'] = false;
                    for (let ar = 0; ar < this.projectAssignedResources.length; ar++) {
                        if (this.templProjectRolesRequired[0].Roles__r[rr].Role__c 
                            == this.projectAssignedResources[ar].Role__c) {
                            console.log(this.projectAssignedResources[ar]);
                            if(this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'] === false) {
                                this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'] = [];
                            }
                            this.templProjectRolesRequired[0].Roles__r[rr]['AssignedResources'].push(
                                JSON.parse(JSON.stringify(this.projectAssignedResources[ar]))
                            );
                        }
                    }

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

        })
        .catch((error) => {
            this.error = error;
            this.usersAvailableForProject = undefined;
        })
        .finally(() => {
            this.isLoading = false;
        })

    }


    setElementDisabledByIdName(id, strName, value) {
        [...this.template.querySelectorAll('lightning-input')]
        .filter(element => (element.dataset.id == id) && (element.name == strName))
        .map(element => { element.disabled = value; });
    }


    handleResourceChecked(event) {
        let resourceId = event.target.dataset.id;
        let checkValue = event.target.checked;
        console.log(resourceId);
        console.log(checkValue);

        if(checkValue) {
            this.setElementDisabledByIdName(resourceId, 'start-date', false);
            this.setElementDisabledByIdName(resourceId, 'end-date', false);
        }
        else {
            this.setElementDisabledByIdName(resourceId, 'start-date', true);
            this.setElementDisabledByIdName(resourceId, 'end-date', true);
        }
    }

    bDateInBusinessDay(dateValue) {
        const d = new Date(dateValue);
        let dayOfTheWeek = d.getDay();
        console.log(dayOfTheWeek);
        return !(dayOfTheWeek==5 || dayOfTheWeek==6);
    }

    bDateBetweenProjectDates(dateValue) {
        const dateIn = new Date(dateValue);
        const projStart = new Date(this.projectStartDate);
        const projEnd = new Date(this.projectEndDate);
        return ((dateIn.getTime() >= projStart.getTime()) && (dateIn.getTime() <= projEnd.getTime()))
    }

    getBusinessDaysBetweenTwoDates(d0, d1) {
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
        // if (startDayW == 0 && endDayW != 6) days = days - 1  
        if (startDayW == 6 && endDayW != 5) days = days - 1  
    
        // Remove end day if span ends on Saturday but starts after Sunday
        // if (endDayW == 6 && startDayW != 0) days = days - 1  
        if (endDayW == 5 && startDayW != 6) days = days - 1  
    
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
            this.setElementValueByIdName(resourceId, 'hours', '');
            return false;
        }
        event.target.classList.remove('slds-has-error');

        // calculate business hours
        if(startDate && endDate) {
            let daysBetweenDates = this.getBusinessDaysBetweenTwoDates(startDate, endDate);

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

        let countErrors = 0;

        checkboxsSelected.forEach((userIdRoleArr, idx) => {
            console.log(idx);
            console.log(userIdRoleArr);

            // assign values (StarDate, EndDate and Hours) to checkboxsSelected list
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == userIdRoleArr[0]) && (element.name == 'start-date')) // idx
            .map(element => {
                console.log(element.value);
                checkboxsSelected[idx].push(element.value);
                if( ! this.bDateBetweenProjectDates(element.value)) {
                    countErrors++;
                }
            });
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == userIdRoleArr[0]) && (element.name == 'end-date')) // idx
            .map(element => {
                console.log(element.value);
                checkboxsSelected[idx].push(element.value);
                if( ! this.bDateBetweenProjectDates(element.value)) {
                    countErrors++;
                }
            });
            [...this.template.querySelectorAll('lightning-input')]
            .filter(element => (element.dataset.id == userIdRoleArr[0]) && (element.name == 'hours')) // idx
            .map(element => {
                console.log(element.value);
                checkboxsSelected[idx].push(element.value);
            });
        })
        console.log(checkboxsSelected);

        if (checkboxsSelected.length > 0 && countErrors==0) {
            this.isLoading = true;
            insertResourcesToProject({projectId: this.recordId, users: checkboxsSelected}) //  startDate: this.projectStartDate, endDate: this.projectEndDate,
            .then((result) => {
                this.showToastSuccess();
                this.result = result;
                // clean the form with apex refresh
                this.refreshApexWire();

                // updateRecord({ fields: { Id: this.recordId } });
                console.log('RESULT:');
                console.log(result);
            })
            .catch((error) => {
                this.error = error;
                console.log(error);
                this.showToastError('Error', error.body.message);
            })
            .finally(() => {
                // this.isLoading = false;
            })
        }
        console.log(checkboxsSelected);

        if(countErrors > 0) {
            this.showToastError('Form Error!', 'Please complete all required Fields.')
        }
    }

    showToastSuccess() {
        this.dispatchEvent( new ShowToastEvent({
            title: 'Users Assigned!',
            message: '',
            variant: 'success'
        }));
    }

    showToastError(errorTitle, errorMessage) {
        this.dispatchEvent( new ShowToastEvent({
            title: errorTitle,
            message: errorMessage,
            variant: 'error'
        }));
    }

    refreshApexWire() {
        refreshApex(this.wireProjectRolesRequired);
        // refreshApex(this.wireProjectAssignedResources);
        // refreshApex(this.wireResourcesAvailable);
        // getRecordNotifyChange(recordIds);
    }

    handleRefresh(event) {
        // this.isLoading = true;
        console.log('Refresh');
        this.refreshApexWire();
    }

    handleDeleteResource(event) {
        console.log(event.target.dataset.id);
        let optionDelete = confirm('Are you sure you want to Delete the Resource?');
        if(optionDelete) {
            this.deleteResourceById(event.target.dataset.id);
        }
    }

    deleteResourceById(resourceId) {
        console.log(resourceId);
        this.isLoading = true;
        deleteRecord(resourceId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Resource Deleted',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting Resource',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
              // this.isLoading = false;
              this.refreshApexWire();
            });

    }

    /*
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
    // }


    /*
    handleDateFocusOut(event) {
        if( ! (event.target.value)) {
            event.target.classList.remove('slds-has-error');
        }
    }
    */

}