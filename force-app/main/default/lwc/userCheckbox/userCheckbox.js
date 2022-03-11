import { LightningElement } from 'lwc';
import getUsersByRole from '@salesforce/apex/getUsersByRole.getUsers';

export default class UserCheckbox extends LightningElement {

    value = [];

    get options() {
        return [
            { label: {UserName}, value: {UserId} },
            { label: {UserName}, value: {UserId} },
        ];
    }

    get selectedValues() {
        return this.value;
    }

    handleChange(e) {
        this.value = e.detail.value;
    }

}
