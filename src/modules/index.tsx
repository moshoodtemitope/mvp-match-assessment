import { useState, useEffect } from "react";
import "./index.scss"
import axios from 'axios';
import randomcolor from "randomcolor"
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import { paths } from "../api-services/urls"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import 'react-accessible-accordion/dist/fancy-example.css';


import { getDateFromISO } from "../utils";
import Logo from "../assets/img/logo.png"
import Toggle from "../assets/img/sidebar-toggle.png"
import Empty from "../assets/img/empty.png"
import Chart from "../assets/img/charts.png"
import Chart2 from "../assets/img/charts-2.png"
import Chart3 from "../assets/img/charts-3.png"
import Chart4 from "../assets/img/charts-4.png"

ChartJS.register(ArcElement, Tooltip, Legend);



interface ReportsDataType {
    hasGateways: boolean
    reportData: any[]
}
interface ChartGenerator {
    data: number[]
    labels: string[]
    colors: string[]
}

export const GenerateReports = () => {





    const [userData, setUserData] = useState<any>([]);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const [reportFilters, setReportFilters] = useState<any>(null);
    const [reportData, setReportData] = useState([]);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const [startDate, onStartChange] = useState(null);
    const [endDate, onEndChange] = useState(null);

    const [projectSelected, setProject] = useState("");
    const [allProjects, saveProjects] = useState<any[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    const [gatewaySelected, setGateway] = useState("");
    const [allGatewaysRetrieved, saveGateways] = useState<any[]>([]);
    const [isLoadingGateways, setIsLoadingGateways] = useState(false);
    let labelsCollections: any = [];
    let totalsCollections: any = [];
    let colorCollections: any = [];
    
    const getInitials =  (name) =>{
        var parts = name.split(' ')
        var initials = ''
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].length > 0 && parts[i] !== '') {
            initials += parts[i][0]
          }
        }
        return initials
      }


    useEffect(() => {
        const fetchUsers = async () => {
            
            let result = await axios.request({
                method: 'GET',
                url: paths.GET_USERS,
            });
            setIsLoadingUser(false)
            setUserData(result.data.data)
        }

        const fetchGateways = async () => {
            setIsLoadingGateways(true)
            let result = await axios.request({
                method: 'GET',
                url: paths.GET_GETWAYS,
            });
            setIsLoadingGateways(false)
            saveGateways(result.data.data)

        }
        const fetchProjects = async () => {
            setIsLoadingProjects(true);
            let result = await axios.request({
                method: 'GET',
                url: paths.GET_PROJECTS,
            });

            setIsLoadingProjects(false)
            saveProjects(result.data.data);

        }

        fetchUsers()
        fetchGateways()
        fetchProjects()


    }, [])

    useEffect(() => {
        if (endDate && startDate) {
            const getAReport = async () => {
                setIsLoadingReport(true);
                let result = await axios.request({
                    method: 'POST',
                    url: paths.GET_REPORT,
                    data: reportFilters
                });

                setIsLoadingReport(false)
                
                setReportData(result.data.data);

            }
            getAReport()
        }

    }, [reportFilters])

    const setReportParams = () => {

        let filterData = {
            from: getDateFromISO(startDate),
            to: getDateFromISO(endDate),
            projectId: projectSelected,
            gatewayId: gatewaySelected

        }
        setReportFilters(filterData)

    }
    const getProjectNamebyId = (projectId: string): string => {
        return allProjects.filter(project => project.projectId === projectId)[0].name;
    }
    const getwayNamebyId = (gatewayId: string) => {
        return allGatewaysRetrieved.filter(gateway => gateway.gatewayId === gatewayId)[0].name;
    }
    const getProjectsTotal = (projectId?: any, isFormatForced?: boolean) => {
        let projectTotal = 0
        if (projectId) {
            reportData.forEach((report: any) => {
                if (report.projectId === projectId) {
                    // console.log("total is", project)
                    projectTotal += report.amount
                }
            })
            // return Math.round(projectTotal).toLocaleString("en-ng");
        } else {
            reportData.forEach((report: any) => {
                projectTotal += report.amount;
            })
        }
        if (isFormatForced) {
            return Math.round(projectTotal).toLocaleString("en-ng");
        } else {
            return Math.round(projectTotal);
        }

    }


    /**
     * Get Total from All Gateways
     */
    const getGatewaysTotal = (gatewayId?: any, isFormatForced?: boolean) => {
        let gatewayTotal = 0
        if (gatewayId) {
            reportData.forEach((report: any) => {
                if (report.gatewayId === gatewayId) {
                    // console.log("total is", project)
                    gatewayTotal += report.amount
                }
            })
            
        } else {
            reportData.forEach((report: any) => {
                gatewayTotal += report.amount;
            })
        }
        if (isFormatForced) {
            return Math.round(gatewayTotal).toLocaleString("en-ng");
        } else {
            return Math.round(gatewayTotal);
        }

    }


    /**
     * Render A report table
     */
    const GenerateReportTable = ({ hasGateways, reportData }: ReportsDataType) => {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        {hasGateways && <th>Gateway</th>}
                        <th>Transaction ID</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        reportData.map((eachData, index) => {
                            return (
                                <tr key={index}>
                                    <td>{eachData.created}</td>
                                    {hasGateways && <td>{getwayNamebyId(eachData.gatewayId)}</td>}
                                    <td>{eachData.paymentId} </td>
                                    <td>{eachData.amount} USD</td>
                                </tr>
                            )
                        })
                    }

                </tbody>
            </table>
        )
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (ttItem) => (`${ttItem.label}:  ${ttItem.parsed}%`)
                }
            }
        },
    };

    /**
     * Render A Chart
     */
    const GenerateReportChart = ({ data, colors, labels }: ChartGenerator) => {
        
        let chartData = {
            labels,
            datasets: [{
                data,
                backgroundColor: [...colors],
                hoverBackgroundColor: "#F24E1E"
            }]
        }
        return <Doughnut options={chartOptions} data={chartData} />
    }

    const SideBar = () => {
        return (
            <div className="siderbar-wrap">
                <div className="each-sidebar-item">
                    <img src={Chart} alt="" />
                </div>
                <div className="each-sidebar-item">
                    <img src={Chart2} alt="" />
                </div>
                <div className="each-sidebar-item">
                    <img src={Chart3} alt="" />
                </div>
                <div className="each-sidebar-item">
                    <img src={Chart4} alt="" />
                </div>
            </div>
        )
    }
     
    /**
     * No reports
    */
    const EmptyReport = () => {
        return (
            <div className="empty-reports-wrap">
                <div className="empty-report-head">No reports</div>
                <div className="empty-report-msg">Currently you have no data for the reports to be generated. Once you start generating traffic through the Balance application
                    the reports will be shown.
                </div>
                <img src={Empty} alt="" />
            </div>
        )
    }

    /**
     * 
     *Current Filter
     */

    const FilterTxtHeading = () => {
        return (
            <div className="filter-options">
                {projectSelected !== "" ?
                    <span className="eachfilter">{allProjects.filter((project: any) => project.projectId === projectSelected)[0].name}</span>
                    :
                    <span className="eachfilter">All Projects</span>
                }
                {gatewaySelected !== "" ?
                    <span className="eachfilter">{allGatewaysRetrieved.filter((project: any) => project.gatewayId === gatewaySelected)[0].name}</span>
                    :
                    <span className="eachfilter">All Gateways</span>
                }
            </div>
        )
    }


    /**
     * Choose Filters
     */

    const FilterSelectors = () => {
        return (
            <div className="report-filters">
                <div className="each-filter">
                    {isLoadingProjects && <div className="loading-data">Loading Projects...</div>}
                    {!isLoadingProjects &&
                        <select value={projectSelected} id="" onChange={(selected) => {
                            setReportData([])
                            setProject(selected.target.value)
                        }}>
                            <option value="">Select Project</option>
                            <option value="">All Projects</option>
                            {allProjects.map((eachItem: any, index: number) => (
                                <option value={eachItem.projectId} key={index}>{eachItem.name}</option>
                            ))}
                        </select>
                    }
                </div>
                <div className="each-filter">
                    {isLoadingGateways && <div className="loading-data">Loading Gateways...</div>}
                    {!isLoadingGateways &&

                        <select value={gatewaySelected} onChange={(selected) => {
                            setReportData([])
                            setGateway(selected.target.value)
                        }}>
                            <option value="">Select Gateway</option>
                            <option value="">All Gateways</option>
                            {allGatewaysRetrieved.map((eachItem: any, index: number) => (
                                <option value={eachItem.gatewayId} key={index}>{eachItem.name}</option>
                            ))}
                        </select>
                    }
                </div>
                <div className="each-filter">
                    <DatePicker
                        selected={startDate}
                        onChange={date => {
                            setReportData([])
                            onStartChange(date)
                        }}
                        minDate={new Date("01-01-2021")}
                        maxDate={new Date("12-31-2021")}
                        placeholderText="From date"
                    />

                </div>
                <div className="each-filter">
                    <DatePicker
                        selected={endDate}
                        onChange={date => {
                            setReportData([])
                            onEndChange(date)
                        }}
                        minDate={new Date("01-01-2021")}
                        maxDate={new Date("12-31-2021")}
                        placeholderText="To date"
                    />

                </div>
                <div className="each-filter">
                    <button
                        onClick={setReportParams}
                        disabled={isLoadingReport}
                        className="btn-action">
                        {isLoadingReport ? "Generating..." : "Generate report"}
                    </button>
                </div>
            </div>
        )
    }


    /**
     * All Projects and all Gateways Chosen
     */
    const AllProjectWithGateways = () => {

        return (
            <div className="reports-wrap">
                <div className="results-panel">
                    {/* filter options */}
                    <FilterTxtHeading />

                    {/* All Projects, All Gateways  */}
                    <Accordion allowMultipleExpanded allowZeroExpanded={true}>
                        {
                            allProjects.map((eachProject, index) => {
                                // let collectiveTotal = Number(getProjectsTotal());
                                let eachRecordTotal = (isFormatForced?: boolean) => getProjectsTotal(eachProject.projectId, isFormatForced);
                                // let eachRecordTotalValue = Number(getProjectsTotal(eachProject.projectId));
                                let eachRecordName = getProjectNamebyId(eachProject.projectId);

                                // labelsCollections.push(eachRecordName);
                                // totalsCollections.push(Math.round((eachRecordTotalValue * 100) / collectiveTotal));
                                // colorCollections.push(randomcolor({ count: 1, format: "rgba", hue: "random" }))


                                return (
                                    <AccordionItem uuid={`index-${index}`} key={index}>
                                        <AccordionItemHeading>
                                            <AccordionItemButton>
                                                <span>{eachRecordName}</span>
                                                <span> TOTAL: {eachRecordTotal(true)} USD</span>
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel>
                                            <GenerateReportTable
                                                hasGateways={gatewaySelected !== "" ? false : true}
                                                reportData={reportData}
                                            />
                                            {/* Place it {index} */}
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                )
                            })
                        }
                    </Accordion>
                </div>
                <div className="results-panel">
                    <div className="main-total">TOTAL:{getProjectsTotal(null, true)} USD</div>
                </div>
            </div>
        )

    }

    /**
     * Single Project and Single Gateway Chosen
     */

    const SingleProjectSingleGateway = () => {
        let totalAmount  = 0;
        reportData.forEach((report: any) => totalAmount += report.amount)
        return (
            <div className="reports-wrap">
                <div className="results-panel">
                    {/* filter options */}
                    <FilterTxtHeading />


                    <GenerateReportTable
                        hasGateways={false}
                        reportData={reportData}
                    />

                </div>
                <div className="results-panel">
                    <div className="main-total">TOTAL | {totalAmount.toLocaleString("en-ng")} USD</div>
                </div>
            </div>
        )

    }

    /**
     * All Projects  and single Gateway  Chosen
     */

    const AllProjectWithSingleGateway = () => {
        totalsCollections.length = 0;
        colorCollections.length = 0;
        labelsCollections.length = 0;
        return (
            <div className="reports-wrap with-sidepanel">
                <div className="results-panel">

                    <FilterTxtHeading />


                    <Accordion allowMultipleExpanded allowZeroExpanded={true}>
                        {
                            allProjects.map((eachProject, index) => {
                                let collectiveTotal = Number(getProjectsTotal());
                                let eachRecordTotal = (isFormatForced?: boolean) => getProjectsTotal(eachProject.projectId, isFormatForced);
                                let eachRecordTotalValue = Number(getProjectsTotal(eachProject.projectId));
                                let eachRecordName = getProjectNamebyId(eachProject.projectId);

                                labelsCollections.push(eachRecordName);
                                totalsCollections.push(Math.round((eachRecordTotalValue * 100) / collectiveTotal));
                                colorCollections.push(randomcolor({ count: 1, format: "rgba", hue: "random" }))

                                console.log("totalsCollections", totalsCollections.length)

                                return (
                                    <AccordionItem uuid={`index-${index}`} key={index}>
                                        <AccordionItemHeading>
                                            <AccordionItemButton>
                                                <span>{eachRecordName}</span>
                                                <span> TOTAL: {eachRecordTotal(true)} USD</span>
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel>
                                            <GenerateReportTable
                                                hasGateways={false}
                                                reportData={reportData}
                                            />

                                        </AccordionItemPanel>
                                    </AccordionItem>
                                )
                            })
                        }
                    </Accordion>
                </div>




                <div className="charts-section">
                    <GenerateReportChart
                        data={totalsCollections}
                        labels={labelsCollections}
                        colors={colorCollections}
                    />
                    <div className="results-panel">
                        <div className="main-total">GATEWAY TOTAL | {getProjectsTotal(null, true)} USD</div>
                    </div>
                </div>

            </div>
        )
    }


    /**
     * All Gateways and single Project  Chosen
     */
    const AllGatewaysSingleWithProject = () => {
        totalsCollections.length = 0;
        colorCollections.length = 0;
        labelsCollections.length = 0;
        return (
            <div className="reports-wrap with-sidepanel">
                <div className="results-panel">

                    <FilterTxtHeading />


                    <Accordion allowMultipleExpanded allowZeroExpanded={true}>
                        {
                            allGatewaysRetrieved.map((allGatewaysRetrieved, index) => {
                                let collectiveTotal = Number(getGatewaysTotal());
                                let eachRecordTotal = (isFormatForced?: boolean) => getGatewaysTotal(allGatewaysRetrieved.gatewayId, isFormatForced);
                                let eachRecordTotalValue = Number(getGatewaysTotal(allGatewaysRetrieved.gatewayId));
                                let eachRecordName = getwayNamebyId(allGatewaysRetrieved.gatewayId);

                                labelsCollections.push(eachRecordName);
                                totalsCollections.push(Math.round((eachRecordTotalValue * 100) / collectiveTotal));
                                colorCollections.push(randomcolor({ count: 1, format: "rgba", hue: "random" }))

                                console.log("totalsCollections", totalsCollections)

                                return (
                                    <AccordionItem uuid={`index-${index}`} key={index}>
                                        <AccordionItemHeading>
                                            <AccordionItemButton>
                                                <span>{eachRecordName}</span>
                                                <span> TOTAL: {eachRecordTotal(true)} USD</span>
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel>
                                            <GenerateReportTable
                                                hasGateways={false}
                                                reportData={reportData}
                                            />

                                        </AccordionItemPanel>
                                    </AccordionItem>
                                )
                            })
                        }
                    </Accordion>
                </div>




                <div className="charts-section">
                    <GenerateReportChart
                        data={totalsCollections}
                        labels={labelsCollections}
                        colors={colorCollections}
                    />
                    <div className="results-panel">
                        <div className="main-total">PROJECT TOTAL | {getGatewaysTotal(null, true)} USD</div>
                    </div>
                </div>

            </div>
        )
    }


    return (

        <div className="page-container">
            <div className="dashboard-header-wrap">
                <div className="header-wrap-item">
                    <img src={Logo} alt="" />
                    <img src={Toggle} alt="" />
                </div>
                {!isLoadingUser &&
                <div className="header-wrap-item">
                    <div className="user-initials">{getInitials(`${userData[0].firstName} ${userData[0].lastName}`)} </div>
                    <div className="username-txt">{userData[0].firstName} {userData[0].lastName}</div>
                </div>
                }
            </div>
            <div className="page-content-wrap">
                <SideBar />
                {/* <PageContent /> */}
                <div className="dashboard-content">
                    <div className="header-wrap">
                        <div className="header-item">
                            <div className="head-txt">Reports</div>
                            <div className="head-subtxt">Easily generate a report of your transactions</div>
                        </div>
                        <div className="header-item">
                            <FilterSelectors />
                        </div>
                    </div>

                    {isLoadingReport &&
                        <div className="loading-txt">
                            Loading report ...
                        </div>
                    }
                    {(reportData.length === 0 && !isLoadingReport) &&
                        <EmptyReport />
                    }


                    {(reportData.length >= 1 && gatewaySelected === "" && projectSelected === "") &&
                        <AllProjectWithGateways />
                    }

                    {(reportData.length >= 1 && gatewaySelected !== "" && projectSelected === "") &&
                        <AllProjectWithSingleGateway />
                    }

                    {(reportData.length >= 1 && gatewaySelected === "" && projectSelected !== "") &&
                        <AllGatewaysSingleWithProject />
                    }

                    {(reportData.length >= 1 && gatewaySelected !== "" && projectSelected !== "") &&
                        <SingleProjectSingleGateway />
                    }

                   
                </div>
            </div>

        </div>
    )
}