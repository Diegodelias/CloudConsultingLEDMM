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
    public static List<User> getUsersAvailableForProject(Date startDate, Date endDate, List<String> roleList) {

        List<Resource__c> resourcesInProjects = [
            SELECT Id // , Name, Start_Date__c, End_Date__c 
            FROM Resource__c 
            WHERE NOT (
                ((Start_Date__c <= :startDate) AND (End_Date__c >= :startDate))
                OR ((Start_Date__c <= :endDate) AND (End_Date__c >= :endDate))
            )
        ];
        System.debug(resourcesInProjects);

        List<Id> usersIdNOTAvailable = new List<Id>();             
        for (Resource__c res : resourcesInProjects) {
            usersIdNOTAvailable.add(res.Id);            
        }
        System.debug(usersIdNOTAvailable);

        List<User> availableUsersForProject = [
            SELECT Id, Name, UserRole.Name //, (SELECT Start_Date__c, End_Date__c FROM Resources__r WHERE NOT ((Start_Date__c >= :endDate) OR (End_Date__c <= :startDate)))
            FROM User
            WHERE (Id NOT IN :usersIdNOTAvailable) AND (UserRole.Name IN :roleList)
            ORDER BY UserRole.Name
        ];
        System.debug(availableUsersForProject);

        return availableUsersForProject;
    }


    @AuraEnabled(cacheable=true)
    public static List<Resource__c> insertUsersToProject(Id projectId, Date startDate, Date endDate, List<Id> usersId) {
        List<Resource__c> resources = new List<Resource__c>();

        for (Id userId : usersId) {
            Resource__c resource = new Resource__c(
                Project__c = projectId,
                User__c = userId,
                Start_Date__c = startDate,
                Role__c = '',
                End_Date__c = endDate
            );
            resources.add(resource);
        }

        try {
            insert(resources);
        } catch (Exception e) {
            System.debug(e.getMessage());
        }

        return resources;
    }

}