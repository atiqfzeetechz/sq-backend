import { Test } from '../models/Test';
import { Customer } from '../models/Customer';

export const updateCustomerWorkload = async (customerId: any, userId: any) => {
  try {
    const tests = await Test.find({ customerId, userId });
    
    if (tests.length === 0) {
      await Customer.findByIdAndUpdate(customerId, { workload: 0 });
      return;
    }
    
    let totalParamSum = 0;
    let totalDays = 0;
    
    tests.forEach((test) => {
      const excludeFields = ['_id', 'serialNumber', 'startDate', 'endDate', 'remarks', 'customerId', 'userId', '__v', 'createdAt', 'updatedAt'];
      let testParamSum = 0;
      
      Object.keys(test.toObject()).forEach(key => {
        if (!excludeFields.includes(key)) {
          const value = test[key];
          const numValue = Number(value);
          if (!isNaN(numValue) && value !== null && value !== undefined && value !== '') {
            testParamSum += numValue;
          }
        }
      });
      
      totalParamSum += testParamSum;
      
      const start = new Date(test.startDate);
      const end = new Date(test.endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalDays += daysDiff || 1;
    });
    
    const workload = totalDays > 0 ? (totalParamSum / totalDays) : 0;
    await Customer.findByIdAndUpdate(customerId, { workload: Math.round(workload * 100) / 100 });
  } catch (error) {
    console.error('Error updating workload:', error);
  }
};