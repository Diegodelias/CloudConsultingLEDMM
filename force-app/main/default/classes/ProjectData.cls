public without sharing class ProjectData {

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

    @AuraEnabled(cacheable=true)
    public static List<User> getUsers(Date startDate, Date endDate, List<String> roleList) {

        List<Resource__c> resList = new List<Resource__c>();
        resList = [SELECT Id, Name, Start_Date__c, End_Date__c 
                    FROM Resource__c 
                    WHERE NOT ((Start_Date__c > :endDate) OR (End_Date__c < :startDate))]; //podria usar <= y >= si verifico luego q no se solapen la horas de trabajo en el mismo dia
        List<Id> notAvaiableUsersIds = new List<Id>();             
        for (Resource__c res : resList) {
            notAvaiableUsersIds.add(res.Id);            
        }
           
        List<User> avaiableUsers = new List<User>();
        avaiableUsers = [SELECT Id, Name, UserRole.Name     //, (SELECT Start_Date__c, End_Date__c FROM Resources__r WHERE NOT ((Start_Date__c >= :endDate) OR (End_Date__c <= :startDate)))
                         FROM User WHERE (UserRole.Name IN :roleList) AND Id NOT IN :notAvaiableUsersIds ORDER BY UserRole.Name];    
        
        return avaiableUsers;
    }

}