@isTest
public with sharing class ProjectDataServiceTest {

    //test ProjectDataService.getProjectRolesRequired(Id projectId) method   
    @isTest static void testGetProjectRolesRequired() {
        // Test data setup
        Resource__c[] rsc = TestDataFactory.createResource(1, '14/3/2023', '15/3/2023', 'Developer'); 
        Resource__c[] rsc1 = TestDataFactory.createResource(1, '15/3/2023', '16/3/2023', 'Developer'); 
        List<Project__c> lss = [SELECT ID FROM Project__c];    
        // Perform test
        Test.startTest();
        List<Project__c> result = new List<Project__c>();
        List<Project__c> result1 = new List<Project__c>();
        for(Project__c res : lss) {
           result = ProjectDataService.getProjectRolesRequired(res.Id); 
           result1 = ProjectDataService.getProjectRolesRequired(res.Id);   
        }     
        Test.stopTest();
        // Verify 
        System.assertEquals(1, result.size());
        System.assertEquals(1, result1.size());
    }
    
    //test ProjectDataService.getAssignedResources(Id projectId) method   
    @isTest static void testAssignedResourcesQuantity() {
        // Test data setup
        Resource__c[] rsc = TestDataFactory.createResource(6, '14/3/2023', '15/3/2023', 'Developer'); 
        List<Project__c> lss = [SELECT ID FROM Project__c];    
        // Perform test
        Test.startTest();
		List<Resource__c> result = new List<Resource__c>();   
        for(Project__c res : lss) {
            result = ProjectDataService.getAssignedResources(res.Id);
        }     
        Test.stopTest();
        // Verify 
        System.assertEquals(6, result.size());
    }
    
    // test ProjectDataService..getUsersAvailableForProject(Date startDate, Date endDate, List<String> roleList) method
    @isTest static void testGetUsersAvailableForProject_AvaiableUsers() {
        // Test data setup
        User[] defaultUs = [SELECT Id FROM User WHERE UserRole.Name = 'Developer'];
        User[] usr = TestDataFactory.createAvaiableUser(3, 'Developer');
        Resource__c[] rsc = TestDataFactory.createResource(3, '22/1/2023', '23/1/2023', 'Developer'); 
        List<String> ls = new List<String>{'Developer'};    
        // Perform test
        Test.startTest();        
        List<User> result = ProjectDataService.getUsersAvailableForProject(date.parse('20/1/2023'), date.parse('21/1/2023'), ls);
        List<User> result1 = ProjectDataService.getUsersAvailableForProject(date.parse('24/1/2023'), date.parse('24/1/2023'), ls);
        List<User> result2 = ProjectDataService.getUsersAvailableForProject(null, null, ls);
        Test.stopTest();
        
        // Verify 
       // System.assertEquals(2, result.size());
        System.assertEquals(defaultUs.size() + 3, result.size());
        System.assertEquals(defaultUs.size() + 3, result1.size());
        System.assertEquals(defaultUs.size() + 3, result2.size());
    }
    @isTest static void testGetUsersAvailableForProject_NotAvaiableUsers() {
        // Test data setup
        User[] defaultUs = [SELECT Id FROM User WHERE UserRole.Name = 'Consultant'];
        Resource__c[] rsc = TestDataFactory.createResource(3, '22/1/2023', '24/1/2023', 'Consultant'); 
        List<String> ls = new List<String>{'Consultant'};
        // Perform test
        Test.startTest();        
        List<User> result =  ProjectDataService.getUsersAvailableForProject(date.parse('22/3/2023'), date.parse('23/3/2023'), ls);
        List<User> result1 =  ProjectDataService.getUsersAvailableForProject(date.parse('20/3/2023'), date.parse('22/3/2023'), ls);
        List<User> result2 =  ProjectDataService.getUsersAvailableForProject(date.parse('24/3/2023'), date.parse('24/3/2023'), ls);
        List<User> result3 =  ProjectDataService.getUsersAvailableForProject(date.parse('23/3/2023'), date.parse('23/3/2023'), ls);
        Test.stopTest();
        // Verify 
        System.assertEquals(defaultUs.size() + 0, result.size());
        System.assertEquals(defaultUs.size() + 0, result1.size());
        System.assertEquals(defaultUs.size() + 0, result2.size());
        System.assertEquals(defaultUs.size() + 0, result3.size());
    }
    @isTest static void testGetUsersAvailableForProject_CorrectRoleUser() {
        // Test data setup
        User[] defaultUs = [SELECT Id FROM User WHERE (UserRole.Name = 'Consultant')
                                                       OR (UserRole.Name = 'Developer')
                                                       OR (UserRole.Name = 'Squad lead')
                                                       OR (UserRole.Name = 'Architect')];
        User[] usr0 = TestDataFactory.createAvaiableUser(1, 'Developer');
        User[] usr1 = TestDataFactory.createAvaiableUser(1, 'Consultant');
        User[] usr2 = TestDataFactory.createAvaiableUser(1, 'Architect');
        User[] usr3 = TestDataFactory.createAvaiableUser(1, 'Squad lead');
        List<String> ls = new List<String>{'Developer','Consultant','Architect','Squad lead'};    
        // Perform test
        Test.startTest();        
        List<User> result = ProjectDataService.getUsersAvailableForProject(null, null, ls);
        Test.stopTest();
        // Verify 
        System.assertEquals(defaultUs.size() + 4, result.size());
    }
    @isTest static void testGetUsersAvailableForProject_IncorrectRoleUser() {
    //    // Test data setup
        User[] defaultUs = [SELECT Id FROM User WHERE (UserRole.Name = 'Consultant')
                                                       OR (UserRole.Name = 'Developer')
                                                       OR (UserRole.Name = 'Squad lead')
                                                       OR (UserRole.Name = 'Architect')];
        User[] usr0 = TestDataFactory.createAvaiableUser(3, 'CEO');

        List<String> ls = new List<String>{'Developer','Consultant','Architect','Squad lead'};    
        // Perform test
        Test.startTest();        
        List<User> result = ProjectDataService.getUsersAvailableForProject(null, null, ls);
        Test.stopTest();
        // Verify 
        System.assertEquals(defaultUs.size() + 0, result.size());
    }
    
    //test ProjectDataService.insertResourcesToProject(Id projectId, List<List<String>> users) method
    @isTest static void testInsertResourcesToProject() {
        // Test data setup
        Resource__c[] rsc = TestDataFactory.createResource(5, '22/1/2023', '23/1/2023', 'Developer'); 
		List<Project__c> projs = [SELECT ID FROM Project__c]; 
        List<List<String>> ls = new List<List<String>>();
        ls = TestDataFactory.createThreeUsersList();    
        // Perform test
        Test.startTest();        
        List<Resource__c> result = new List<Resource__c>();   
        for(Project__c res : projs) {
            result = ProjectDataService.insertResourcesToProject(res.Id, ls);
        }     
        Test.stopTest();
        // Verify 
        //Resources[] comparison = [SELECT Id FROM Resources__c WHERE ProjectId = AND Id = ]  
        System.assertEquals(3, result.size());
    }
    
}