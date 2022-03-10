import { api, LightningElement, wire } from 'lwc';
import getProjectRolesRequired from '@salesforce/apex/ProjectData.getProjectRolesRequired';


export default class AssignResourcesByRole extends LightningElement {
    @api recordId;

    projectRolesRequired;

    @wire(getProjectRolesRequired, { projectId: '$recordId' })
    projRolesRequired(data, error) {
        if (data) {
        this.projectRolesRequired = data;
            console.log('this.projectRolesRequired');
            console.log(this.recordId);
            console.log(this.projectRolesRequired);
        } else if(error) {
            console.log('ERROR en APEX');
            console.log(error);
            this.projectRolesRequired = undefined;
            this.error = error;
        }
    }


    handleClick() {
        console.log('this.projectRolesRequired');
        console.log(this.recordId);
        console.log(this.projectRolesRequired);
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