import  React  from 'react';
declare module "*.jpg" {
    export default "" as string;
}
declare module "*.png" {
    export default "" as string;
}

export interface RequestProps{
    url: string,
    method: string,
    data?:any
    headers?: any
}

export interface ReportType{
    from: string,
    to: string,
    gatewayId?:any
    projectId?: any
}