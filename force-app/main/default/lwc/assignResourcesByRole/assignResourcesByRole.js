import { api, LightningElement, wire } from 'lwc';
import getProjectRolesRequired from '@salesforce/apex/ProjectData.getProjectRolesRequired';


export default class AssignResourcesByRole extends LightningElement {
    @api recordId;

    cardTitle;

    projectName;

    @wire(getProjectRolesRequired, { projectId: '$recordId' })
    projectRolesRequired;

    handleClick() {
        console.log('this.projectRolesRequired');
        console.log(this.recordId);
        console.log(this.projectRolesRequired);
        console.log(this.projectRolesRequired.data.Name);
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