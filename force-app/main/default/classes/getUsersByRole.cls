public class getUsersByRole {
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

    @AuraEnabled(cacheable=true)
    public static List<User> getUsersById(List<Id> idList) {
        List<User> userList = [SELECT Id, Name, Role FROM User WHERE Id in :idList];
        return userList;
    }

    @AuraEnabled(cacheable=true)
    public static List<Date> getProjectDates(List<Id> idList) {
        List<User> userList = [SELECT Id, Name, Role FROM User WHERE Id in :idList];
        return userList;
    }

    @AuraEnabled(cacheable=true)
    public static Id getProjectId() {  
        return UserInfo.getUserId()
    }

    
}