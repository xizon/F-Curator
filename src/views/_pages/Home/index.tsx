import React, { useRef, useEffect, useState } from 'react';
import { Space, Input, Modal, Button, Select } from 'antd';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import AppInfo from '@/components/AppInfo';
import Group from '@/components/Group';
import Welcome from '@/components/Welcome';
import isValidHttpUrl from '@/helpers/isValidHttpUrl';
import uniqueArr from '@/helpers/uniqueArr';


import 'antd/dist/antd.css';

const { Option } = Select;
const { Search } = Input;

// for electron
const { ipcRenderer } = window.require('electron');
let resURLs: any[] = [];
let resCategories: any[] = [];
let currentAllURLs: any[] = [];


// Avoid EventEmitter memory leak detected
ipcRenderer.setMaxListeners(Infinity);


export default function Home() {

    const refInputUrl = useRef<any>(null);
    const refInputTitle = useRef<any>(null);

    const [dataURLs, setDataURLs] = useState<any[]>([]);
    const [dataCategories, setDataCategories] = useState<any[]>([]);
    const [category, setCategory] = useState<string>();
    const [inputTitle, setInputTitle] = useState<string>('');
    const [inputUrl, setInputUrl] = useState<string>('');
    const [inputSearch, setInputSearch] = useState<string>('');


    //------------------------------------------
    function updateData() {

        // Unregister from ipcRenderer.on event listener
        ipcRenderer.removeAllListeners('INITIALIZE_DATA');
        ipcRenderer.removeAllListeners('APP_INFO');
        ipcRenderer.removeAllListeners('EXPORT_INFO');

        // Receiving on main process
        ipcRenderer.on('INITIALIZE_DATA', (event, curData) => {

            // Modal action
            //------------------
            setConfirmLoading(false);
            setVisible(false);

            // URLs
            //------------------
            // Initialize the database
            resURLs = curData.urls;

            //update data
            if (typeof (curData.urls.error) === 'undefined') {
                resURLs.push(curData.urls);
            }

            let _resURLs = uniqueArr(resURLs);
            _resURLs.splice(-1, 1); //remove the first empty item

            setDataURLs(_resURLs);

            currentAllURLs = _resURLs;

            // Categories
            //------------------
            // Initialize the database
            resCategories = curData.categories;

            //update data
            resCategories.push(curData.categories);

            let _resCategories = uniqueArr(resCategories);
            _resCategories.splice(-1, 1); //remove the first empty item

            setDataCategories(_resCategories);

            //set the default category
            setCategory(_resCategories[0]);
            

        });

        ipcRenderer.on('APP_INFO', (event, curData) => {
            setAppInfo({"version":curData.version, "description":curData.description, "name":curData.name});
        });

        ipcRenderer.on('EXPORT_INFO', (event, curData) => {
            setExportHTMLInfo(curData);
            setLoadingExportHTMLFile(false);
        });

        

    }

    function sendData() {

        const _url = refInputUrl?.current?.input.value;
        const _title = refInputTitle?.current?.input.value;
        const _cat = category;


        if (isValidHttpUrl(_url)) {
            // Communicate asynchronously from a renderer process to the main process.
            ipcRenderer.send('DATA_UPDATED_URLS', { url: _url, title: _title, category: _cat });

            // Set button status
            setConfirmLoading(true);
        }

    }

    function handleKeyPress(e) {
        if (e.keyCode === 13) {
            sendData();
        }
    }



    // Modal 1 and Form
    //------------------------------------------
    const [visible, setVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

    function showModalAddnew() {
        setVisible(true);

        //clear input and select
        resetInputField();

    }

    function handleOkAddnew() {
        sendData();
    }

    function handleCancelAddnew() {
        setVisible(false);
    }


    function handleSelectAddnew(value) {
        setCategory(value);
    }

    function handleInputTitle(e) {
        setInputTitle(e.target.value);
    }

    function handleInputUrl(e) {
        setInputUrl(e.target.value);
    }

    function handleOkSearch(value) {
        searchMatch(value);
    }    
    
    function handleInputSearch(e) {
        searchMatch(e.target.value);
        setInputSearch(e.target.value);
    }


    function searchMatch(str) {

        if ( str.length > 0 ) {
            str = str.toLowerCase();

            // match search characters
            const matchList = dataURLs.filter( (item) => {
                return item.title.toLowerCase().includes(str) || item.link.toLowerCase().includes(str);
            });

            setDataURLs(matchList);
        } else {
            setDataURLs(currentAllURLs);
        }

        
        

    }    
                

    function resetInputField() {
        setInputTitle('');
        setInputUrl('');
        setInputSearch('');
    }


    // Modal 2
    //------------------------------------------
    const [appInfo, setAppInfo] = useState<any | null>(null);
    const [visibleAbout, setVisibleAbout] = useState<boolean>(false);
    function showModalAbout(e) {
        e.preventDefault();
        setVisibleAbout(true);
    }



    // Modal 3
    //------------------------------------------
    const [exportHTMLInfo, setExportHTMLInfo] = useState<string>('');
    const [visibleExportHTMLFile, setVisibleExportHTMLFile] = useState<boolean>(false);
    const [loadingExportHTMLFile, setLoadingExportHTMLFile] = useState<boolean>(false);


    function handleOkExportHTMLFile() {
        setLoadingExportHTMLFile(true);

        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('EXPORT_DATA_HTML', false);
    }

    function handleCancelExportHTMLFile() {
        hideModalExportHTMLFile();
    }

    function showModalExportHTMLFile() {
        setVisibleExportHTMLFile(true);
    }
    
    function hideModalExportHTMLFile() {
        setVisibleExportHTMLFile(false);
    }    


    //------------------------------------------
    useEffect(() => {

        // Receiving on main process
        updateData();

        // Handle keyboard shortcuts within a BrowserWindow
        window.addEventListener("keydown", handleKeyPress);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", handleKeyPress);

            // Communicate asynchronously from a renderer process to the main process.
            ipcRenderer.send('DATA_UPDATED_URLS', false);
            ipcRenderer.send('GET_APP_INFO', false);
        };

    }, []); // Empty array ensures that effect is only run on mount and unmount



    return (
        <>

            <Layout
                logo="assets/images/main/side-logo-white.png"
                primaryBtnArea={<>

                    <div className="addnew">
                        <Button type="primary" size="large" shape="circle" onClick={showModalAddnew}>
                            <svg aria-hidden="true" height="25" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>
                        </Button>
                    </div>

                </>}
                secondaryBtnArea={<>
                    <Link to="/category"><svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#d5d5d5" d="M12.83 352h262.34A12.82 12.82 0 0 0 288 339.17v-38.34A12.82 12.82 0 0 0 275.17 288H12.83A12.82 12.82 0 0 0 0 300.83v38.34A12.82 12.82 0 0 0 12.83 352zm0-256h262.34A12.82 12.82 0 0 0 288 83.17V44.83A12.82 12.82 0 0 0 275.17 32H12.83A12.82 12.82 0 0 0 0 44.83v38.34A12.82 12.82 0 0 0 12.83 96zM432 160H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0 256H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg> Category Edit</Link>

                    <a href="#" onClick={showModalExportHTMLFile}>
<svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#d5d5d5" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg> Export HTML</a>

                    <a href="#" onClick={showModalAbout}>About {appInfo ? appInfo.name : null}</a>
                    

                </>}
                contentArea={<>

                    <div className="content">

                        <div className="app-search__wrapper" style={{marginBottom:"17px"}}><Search value={inputSearch} placeholder="Site Name or URL" allowClear onSearch={handleOkSearch} onChange={handleInputSearch} style={{ width:"325px" }} /></div>
                        
                        {dataURLs && dataURLs.length > 0 ? <>

                            <Group data={dataURLs} cat={dataCategories} callback={(res) => {
                                console.log('--> update database: ', res);

                                res.map((item) => {
                                    delete item.id;
                                });

                                // Communicate asynchronously from a renderer process to the main process.
                                ipcRenderer.send('DATA_UPDATED_SORTED_URLS', res);

                            }} />

                        </> : (inputSearch === '' ? <Welcome /> : '')}


                    </div>


                    <AppInfo showText={null} version={''} />


                    <Modal
                        title="Add New"
                        visible={visible}
                        onOk={handleOkAddnew}
                        okText="Confirm"
                        cancelText="Cancel"
                        confirmLoading={confirmLoading}
                        onCancel={handleCancelAddnew}
                        cancelButtonProps={{ shape: "round" }}
                        okButtonProps={{ shape: "round" }}
                    >
                        <Input.Group compact style={{ textAlign: "left" }}>
                            <Space direction="vertical">
                                <Input placeholder="Site Name" id="app-input-title" ref={refInputTitle} style={{ width: "325px" }} value={inputTitle} onChange={handleInputTitle} /><br />
                                <Input placeholder="https://" id="app-input-url" ref={refInputUrl} style={{ width: "325px" }} value={inputUrl} onChange={handleInputUrl} /> <span style={{ color: "red", fontSize: "14px", position: "absolute", marginTop: "-23px", left: "310px" }}>*</span><br />
                                <Select
                                    style={{ minWidth: "150px" }}
                                    onChange={handleSelectAddnew}
                                    placeholder="Choose a category"
                                    value={category}
                                >

                                    {dataCategories && dataCategories.length > 0 ? dataCategories.map((item, index) => {
                                        return <Option key={index} value={item}>{item}</Option>;
                                    }) : ''}


                                </Select>
                            </Space>
                        </Input.Group>
                    </Modal>

                    <Modal
                        centered
                        closable={false}
                        visible={visibleAbout}
                        okText="OK"
                        cancelText="Cancel"
                        onOk={() => setVisibleAbout(false)}
                        onCancel={() => setVisibleAbout(false)}
                        cancelButtonProps={{ shape: "round", style: { display: "none" } }}
                        okButtonProps={{ shape: "round" }}
                    >
                        <p>{appInfo ? appInfo.description : null}</p>
                        <p>Current Version: {`${appInfo ? appInfo.version : null}`}</p>
                    </Modal>


                    <Modal
                        title="Export HTML"
                        visible={visibleExportHTMLFile}
                        onOk={showModalExportHTMLFile}
                        onCancel={handleCancelExportHTMLFile}
                        cancelButtonProps={{ shape: "round" }}
                        okButtonProps={{ shape: "round" }}
                        footer={[
                            <Button key="back" shape="round" onClick={handleCancelExportHTMLFile}>
                              Cancel
                            </Button>,
                            <Button key="submit" type="primary" shape="round" loading={loadingExportHTMLFile} onClick={handleOkExportHTMLFile}>
                              Export
                            </Button>,
                          ]}  
                    >
                        <p>{exportHTMLInfo && exportHTMLInfo !== '' ? <>Package <strong style={{color:"green"}}>{exportHTMLInfo}</strong> exported successfully, please check your computer desktop.</> : 'Export an HTML file package that you can use directly in any operating system\'s browser.'}</p>
                    </Modal>
                    


                </>}
            />


        </>
    );
}

