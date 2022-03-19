@isTest
public with sharing class ProjectDataServiceTest {


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


}