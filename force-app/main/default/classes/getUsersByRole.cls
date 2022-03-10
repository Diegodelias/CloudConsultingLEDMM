public class getUsersByRole {
    public List<User> getUsers(Date startDate, Date endDate, List<String> roleList) {

        List<User> avaiableUsers = new List<User>();
        avaiableUsers = [SELECT Id, Name, UserRole.Name, (SELECT Start_Date__c, End_Date__c FROM Resources__r WHERE Start_Date__c = :startDate)FROM User 
                         WHERE (UserRole.Name IN :roleList)// AND Resource__r.Start_Date__c = :startDate//  (NOT ((Resource__r.Start_Date__c >= :endDate) OR (Resource__r.End_Date__c <= :startDate))) 
                         ORDER BY UserRole.Name];    
        
        return avaiableUsers;
    }
}