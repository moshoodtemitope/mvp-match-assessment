export const getDateFromISO =(date:any) =>{
    let toUse:any = new Date(date);
    let year = toUse.getFullYear(),
        month = toUse.getMonth()+1,
        dt = toUse.getDate();
        
        if (dt < 10) {
        dt = '0' + dt;
        }
        if (month < 10) {
        month = '0' + month;
        }
        
      
    let convertedDate = `${year}-${dt}-${month}`;
    

   
    return convertedDate;
    
}