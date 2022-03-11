import { api, LightningElement, wire } from 'lwc';
import getProjectRolesRequired from '@salesforce/apex/ProjectData.getProjectRolesRequired';
import getUsers from '@salesforce/apex/ProjectData.getUsers';


export default class AssignResourcesByRole extends LightningElement {
    @api recordId;

    cardTitle;

    projectName;

    @wire(getProjectRolesRequired, { projectId: '$recordId' })
    projectRolesRequired;

    @wire(getUsers, { startDate: Date.parse("Aug 9, 1995"), endDate: Date.parse("Aug 15, 1995"), roleList: ['Consultant', 'Developer', 'Architect', 'Squad lead']  })
    resourcesAvailable;

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