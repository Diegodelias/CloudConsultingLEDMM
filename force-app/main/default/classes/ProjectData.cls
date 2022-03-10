/*
                (
                    SELECT Hours_Covered__c, Hours_Required__c, Role__c 
                    FROM Roles__r
                    ORDER BY Role__c
                )

*/

public without sharing class ProjectData {

    @AuraEnabled(cacheable=true)
    public static Project__c getProjectRolesRequired(Id projectId) {
        System.debug(projectId);

        Project__c projectRolesRequired = [
            SELECT Name, Start_Date__c, End_Date__c, Hours_Sold__c, Status__c
            FROM Project__c
            WHERE Id = :projectId
        ];

        System.debug(projectId);
        System.debug(projectRolesRequired);
        return projectRolesRequired;
    }

}