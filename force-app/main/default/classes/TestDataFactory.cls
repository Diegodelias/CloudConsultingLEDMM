@isTest
public class TestDataFactory {
    public static List<User> createAvaiableUser(Integer numUsrs, String usRole) {
        UserRole usrRole = [SELECT Id FROM UserRole Where name = 'Developer'];
        Profile prof = [SELECT Id, Name FROM Profile LIMIT 1];
        List<User> usrList = new List<User>();
        String dateString = String.valueof(Datetime.now().getTime());
        for(Integer i=0;i<numUsrs;i++) {
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
                                         End_Date__c = mystartdate, 
                                         Start_Date__c = myenddate);
        
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert proj;
		}        

        String dateString = String.valueof(Datetime.now().getTime());
        //User usr = new User(FirstName='TestUserFN ',
        //                        LastName='TestUserLN ',
        //                       UserRoleId= usrRole.Id,
        //                       Email = 'test@test'+dateString+'.com',
        //                       Alias = 'Tcode',
        //                       Username = 'test1234444'+dateString+'@test.com',
        //                      LocaleSidKey = 'en_US',
        //                      TimeZoneSidKey = 'GMT',
        //                      ProfileID = prof.Id,
        //                      LanguageLocaleKey = 'en_US',
        //                     EmailEncodingKey = 'UTF-8');
        
        List<Resource__c> rLs = new List<Resource__c>();
        for(Integer i=0;i<numRs;i++) {
        	Resource__c rsc = new Resource__C(//User__c = usr.Id,
                                       	      Start_Date__c = mystartdate,
                                        	  End_Date__c = myenddate,
            								  Project__c = proj.Id);  
            rLs.add(rsc);
        }
        System.runAs ( new User(Id = UserInfo.getUserId()) ) {
            insert rLs;
		}
        return rLs;
    }
}