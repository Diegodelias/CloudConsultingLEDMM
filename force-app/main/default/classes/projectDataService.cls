public without sharing class projectDataService {

    @AuraEnabled(cacheable=true)
    public static List<Project__c> getProjectRolesRequired(Id projectId) {
        System.debug(projectId);

        List<Project__c> projectRolesRequired = [
            SELECT Name, Start_Date__c, End_Date__c, Hours_Sold__c, Status__c,
                (
                    SELECT Hours_Covered__c, Hours_Required__c, Role__c 
                    FROM Roles__r
                    ORDER BY Role__c
                )
            FROM Project__c
            WHERE Id = :projectId
        ];

        System.debug(projectId);
        System.debug(projectRolesRequired);
        return projectRolesRequired;
    }
}