@isTest
public with sharing class TestDataFactory {

    
    public static List<User> createAvaiableUser(Integer numUsrs, String usRole) {
        UserRole usrRole = [SELECT Id FROM UserRole Where name = :usRole];
        Profile prof = [SELECT Id, Name FROM Profile LIMIT 1];
        List<User> usrList = new List<User>();
        String dateString = String.valueof(Datetime.now().getTime());
        for(Integer i=1;i<=numUsrs;i++) {
            User usr = new User(FirstName='TestUserFN ' + i,
                                LastName='TestUserLN ' + i,
                                UserRoleId= usrRole.Id,
                                Email = 'test'+dateString+''+ i +'@test.com',
                                Alias = 'Tcode',
                                Username = 'test1234444'+dateString+''+ i +'@test.com',
                                LocaleSidKey = 'en_US',
                                TimeZoneSidKey = 'GMT',
                                ProfileID = prof.Id,
                                LanguageLocaleKey = 'en_US',
                                EmailEncodingKey = 'UTF-8');
            usrList.add(usr);
        }        
        insert usrList;
        return usrList;
    }


    public static List<Resource__c> createResource(Integer numRs, String startDate, String endDate, String usRole) {
        UserRole usrRole = [SELECT Id FROM UserRole Where name = 'Developer'];
        Profile prof = [SELECT Id, Name FROM Profile LIMIT 1];
        //Account acc = [SELECT Id, Name FROM Account LIMIT 1];
        Account acc = new Account(Name = String.valueof(Datetime.now().getTime()) + 'Name');
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert acc;
		}
                
        date mystartdate = date.parse(startDate);  // '12/27/2009' cambia el formato segun la configuracion de la hora local que puse
        date myenddate = date.parse(endDate);
        
        Project__c proj = new Project__c(Account__c = acc.Id, 
                                         End_Date__c = myenddate, 
                                         Start_Date__c = myenddate);
        
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert proj;
		}        

        String dateString = String.valueof(Datetime.now().getTime());

        List<Resource__c> rLs = new List<Resource__c>();
        for(Integer i=1;i<=numRs;i++) {
        	Resource__c rsc = new Resource__C(//User__c = usr.Id,
                                       	      Start_Date__c = mystartdate,
                                        	  End_Date__c = myenddate,
            								  Project__c = proj.Id,
            								  Role__c = usRole,
            								  Hours__c = 16);  
            rLs.add(rsc);
        }
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert rLs;
		}
        return rLs;
    }
    
    public static List<List<String>> createThreeUsersList() {
        Account acc = new Account(Name = String.valueof(Datetime.now().getTime()) + 'Name');
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert acc;
		}
                
        date mystartdate = date.parse('17/8/2022');  // '12/27/2009' cambia el formato segun la configuracion de la hora local que puse
        date myenddate = date.parse('18/8/2022');
        
        Project__c proj = new Project__c(Account__c = acc.Id, 
                                         End_Date__c = myenddate, 
                                         Start_Date__c = myenddate);
        
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert proj;
		} 
        
        User[] userExamples = createAvaiableUser(3, 'Developer');
        List<List<String>> userLists = new List<List<String>>();  
        List<String> ls1 = new List<String>{userExamples[0].Id,'Developer','2022-8-17','2022-8-18','16'};
        List<String> ls2 = new List<String>{userExamples[1].Id,'Architect','2022-8-17','2022-8-18','16'};
        List<String> ls3 = new List<String>{userExamples[2].Id,'Consultant','2022-8-17','2022-8-18','16'};    
        userLists.add(ls1);
        userLists.add(ls2);
        userLists.add(ls3);
        return userLists;      
    }
    
    public static ID createProjectsForTesting() {
        UserRole usrRole = [SELECT Id FROM UserRole Where name = 'Developer'];
        Profile prof = [SELECT Id, Name FROM Profile LIMIT 1];
        Account acc = new Account(Name = String.valueof(Datetime.now().getTime()) + 'Name');
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert acc;
		}
                      
        Project__c proj = new Project__c(Account__c = acc.Id, 
                                         End_Date__c = date.parse('20/1/2023'), 
                                         Start_Date__c = date.parse('23/1/2023'));
        
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert proj;
		}
        ID pId = proj.Id;
        return pId;
    }
    
    
   
   
}