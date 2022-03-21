public without sharing class ProjectDataService {

    @AuraEnabled(cacheable=true)
    public static List<Project__c> getProjectRolesRequired(Id projectId) {
        System.debug(projectId);

        List<Project__c> projectRolesRequired = [
            SELECT Name, Start_Date__c, End_Date__c, Hours_Sold__c, Status__c,
                (
                    SELECT Hours_Covered__c, Hours_Required__c, Role__c 
                    FROM Roles__r
                    ORDER BY Role__c DESC
                )
            FROM Project__c
            WHERE Id = :projectId
        ];

        System.debug(projectId);
        System.debug(projectRolesRequired);
        return projectRolesRequired;
    }


    @AuraEnabled(cacheable=false)
    public static List<Resource__c> getAssignedResources(Id projectId) {
        List<Resource__c> assignedResList = [
            SELECT Id, User__r.Name, Start_Date__c, End_Date__c, Hours__c, Role__c 
            FROM Resource__c 
            WHERE Project__c = :projectId
            ORDER BY Role__c DESC
        ];
        return assignedResList;
    }


    @AuraEnabled(cacheable=false)
    public static List<User> getUsersAvailableForProject(Date startDate, Date endDate, List<String> roleList) {

        system.debug(startDate);
        system.debug(endDate);
        List<Resource__c> resourcesInProjects = [
            SELECT User__c, User__r.Name // Id, Name, Start_Date__c, End_Date__c 
            FROM Resource__c 
            WHERE ((Start_Date__c <= :startDate) AND (End_Date__c >= :startDate))
					OR ((Start_Date__c <= :endDate) AND (End_Date__c >= :endDate))
				OR
					((Start_Date__c >= :startDate) AND (End_Date__c <= :endDate))
                    
        ];
        System.debug(resourcesInProjects);

        List<Id> usersIdNOTAvailable = new List<Id>();             
        for (Resource__c res : resourcesInProjects) {
            usersIdNOTAvailable.add(res.User__c);
            System.debug(res.User__c);
            System.debug(res.User__r.Name);
        }
        System.debug(usersIdNOTAvailable);

        List<User> availableUsersForProject = [
            SELECT Id, Name, UserRole.Name //, (SELECT Start_Date__c, End_Date__c FROM Resources__r WHERE NOT ((Start_Date__c >= :endDate) OR (End_Date__c <= :startDate)))
            FROM User
            WHERE (Id NOT IN :usersIdNOTAvailable) AND (UserRole.Name IN :roleList)
            ORDER BY UserRole.Name DESC
        ];
        System.debug(availableUsersForProject);

        return availableUsersForProject;
    }

    @AuraEnabled(cacheable=false)
    public static List<Resource__c> insertResourcesToProject(Id projectId, List<List<String>> users) { //  Date startDate, Date endDate,
        List<Resource__c> resources = new List<Resource__c>();

        for (List<String> user : users) {
            Resource__c resource = new Resource__c(
                Project__c = projectId,
                User__c = user[0],
                Role__c = user[1],
                Start_Date__c = date.valueOf(user[2]),
                End_Date__c = date.valueOf(user[3]),
                Hours__c = integer.valueOf(user[4])
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