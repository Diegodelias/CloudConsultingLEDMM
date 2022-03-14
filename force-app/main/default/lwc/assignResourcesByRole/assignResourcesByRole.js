import { api, LightningElement, wire } from 'lwc';
import { getSObjectValue } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getProjectRolesRequired from '@salesforce/apex/ProjectData.getProjectRolesRequired';
import getUsersAvailableForProject from '@salesforce/apex/ProjectData.getUsersAvailableForProject';
import insertUsersToProject from '@salesforce/apex/ProjectData.insertUsersToProject';

import PROJECT_START_DATE from '@salesforce/schema/Project__c.Start_Date__c'
import PROJECT_END_DATE from '@salesforce/schema/Project__c.End_Date__c'

export default class AssignResourcesByRole extends LightningElement {
    @api recordId;

    // cardTitle;

    projectStartDate;
    projectEndDate;

    templProjectRolesRequired;
    usersAvailableForProject;

    @wire(getProjectRolesRequired, { projectId: '$recordId' })
    projectRolesRequired;

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
    resourcesAvailable({ error, data }) {
        if (data) {
            this.usersAvailableForProject = data;
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

        } else if (error) {
            this.error = error;
            this.usersAvailableForProject = undefined;
        }
    }

    handleInsertSelectedResources(event) {
        console.log('event.detail' + event.detail);
        let checkboxsSelected = [...this.template.querySelectorAll('lightning-input')]
            .filter(element => element.checked)
            .map(element => element.dataset.id);
        if (checkboxsSelected.length > 0) {
            insertUsersToProject({projectId: this.recordId, startDate: this.projectStartDate, endDate: this.projectEndDate, usersId: checkboxsSelected})
            .then((result) => {
                this.handleSuccess();
                this.result = result;
                console.log(result);
            })
            .catch((error) => {
                this.error = error;
                console.log(error);
            })

        }
        console.log(checkboxsSelected);

    }

    handleSubmit(event) {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        console.log('fields');
        console.log(fields);
        // this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess() {
        this.dispatchEvent( new ShowToastEvent({
            title: 'Users Assigned!',
            message: '',
            variant: 'succes'
        }));
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

}