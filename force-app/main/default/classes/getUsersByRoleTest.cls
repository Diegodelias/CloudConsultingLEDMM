@isTest
public class getUsersByRoleTest {
    @isTest static void testAvaiableUsers() {
        // Test data setup
        User[] usr = TestDataFactory.createAvaiableUser(5, 'Developer');
        Resource__c[] rsc = TestDataFactory.createResource(5, '20/1/2022', '23/1/2022', 'Developer'); 
        List<String> ls = new List<String>{'Developer'};    
        // Perform test
        Test.startTest();        
        List<User> result = getUsersByRole.getUsers(null, null, ls);
        List<User> result1 = getUsersByRole.getUsers(date.parse('15/1/2022'), date.parse('19/1/2022'), ls);
        List<User> result2 = getUsersByRole.getUsers(date.parse('24/1/2022'), date.parse('26/1/2022'), ls);
        Test.stopTest();
        // Verify 
        System.assertEquals(5, result.size());
        System.assertEquals(5, result1.size());
        System.assertEquals(5, result2.size());
    }
    @isTest static void testNotAvaiableUsers() {
        // Test data setup
        Resource__c[] rsc = TestDataFactory.createResource(5, '20/1/2022', '23/1/2022', 'Developer'); 
        List<String> ls = new List<String>{'Developer'};
        // Perform test
        Test.startTest();        
        List<User> result =  getUsersByRole.getUsers(date.parse('20/1/2022'), date.parse('23/1/2022'), ls);
        List<User> result1 =  getUsersByRole.getUsers(date.parse('15/1/2022'), date.parse('20/1/2022'), ls);
        List<User> result2 =  getUsersByRole.getUsers(date.parse('23/1/2022'), date.parse('25/1/2022'), ls);
        List<User> result3 =  getUsersByRole.getUsers(date.parse('21/1/2022'), date.parse('22/1/2022'), ls);
        Test.stopTest();
        // Verify 
        System.assertEquals(0, result.size());
        System.assertEquals(0, result1.size());
        System.assertEquals(0, result2.size());
        System.assertEquals(0, result3.size());
    }

}