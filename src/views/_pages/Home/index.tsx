import React, { useRef, useEffect, useState } from 'react';
import { Space, Input, Modal, Button, Select, Typography  } from 'antd';
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
const { Text } = Typography;

// for electron
const { ipcRenderer } = window.require('electron');
const isMac = process.platform === 'darwin';
let resURLs: any[] = [];
let resCategories: any[] = [];
let currentAllURLs: any[] = [];


// Avoid EventEmitter memory leak detected
ipcRenderer.setMaxListeners(Infinity);


export default function Home() {

    const refInputUrl = useRef<any>(null);
    const refInputTitle = useRef<any>(null);

    
    const [isSearch, setIsSearch] = useState<boolean>(false);
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
        ipcRenderer.removeAllListeners('IMPORT_INFO');
        ipcRenderer.removeAllListeners('NOTIFY_UPDATE');

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
            setAppInfo({"version":curData.version, "description":curData.description, "name":curData.name, "website": curData.website});
        });

        ipcRenderer.on('EXPORT_INFO', (event, curData) => {
            if ( curData.ok ) setExportHTMLInfo(curData.ok);
            if ( curData.error ) setExportHTMLInfo(curData.error);
            setLoadingExportHTMLFile(false);


            //hide buttons
            Array.prototype.slice.call( document.querySelectorAll( '.app-export-modalbtn' ) ).forEach( (node) => {
                node.style.display = 'none';
            });
        });

        ipcRenderer.on('IMPORT_INFO', (event, curData) => {
            if ( curData.ok ) setImportHTMLInfo(curData.ok);
            if ( curData.error ) setImportHTMLInfo(curData.error);

            //hide buttons
            Array.prototype.slice.call( document.querySelectorAll( '.app-import-modalbtn' ) ).forEach( (node) => {
                node.style.display = 'none';
            });
        });

        ipcRenderer.on('NOTIFY_UPDATE', (event, curData) => {
            setUpdateInfo({"version":curData.version, "website": curData.website});
            setVisibleUpdateApp(true);
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



    // Modal 1 and Form (Add New)
    //------------------------------------------
    const [visible, setVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

    // Change event fires extra times before IME composition ends
    const [onComposition, setOnComposition] = useState(false);

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
    
    function handleInputSearchComposition(e) {

        if (e.type === 'compositionend') {
            setOnComposition(false);

            //fire change method to update
            handleInputSearchChange(e);

        } else {
            setOnComposition(true);
        }
    }
    function handleInputSearchChange(e) {
        const val = e.target.value
        if(!onComposition){
            searchMatch(val);
        }

        setInputSearch(val);
    }


    function searchMatch(str) {

        if ( str.length > 0 ) {
            str = str.toLowerCase();

            // match search characters
            const matchList = dataURLs.filter( (item) => {

                // Check if variable contains Chinese/Japanese characters
                const hasCJ = item.title.match(/[\u3400-\u9FBF]/) !== null && item.title.match(/[\u3400-\u9FBF]/).length > 0 ? true : false;
                const _title = hasCJ ? item.title : item.title.toLowerCase();

                return _title.includes(str) || item.link.toLowerCase().includes(str);
            });

            setDataURLs(matchList);
            setIsSearch(true);
        } else {
            setDataURLs(currentAllURLs);
            setIsSearch(false);

            
            // Communicate asynchronously from a renderer process to the main process.
            ipcRenderer.send('DATA_UPDATED_URLS', false);            
        }

        
        

    }    
                

    function resetInputField() {
        setInputTitle('');
        setInputUrl('');
        setInputSearch('');
    }


    // Modal 2 (About)
    //------------------------------------------
    const [appInfo, setAppInfo] = useState<any | null>(null);
    const [visibleAbout, setVisibleAbout] = useState<boolean>(false);
    function showModalAbout(e) {
        e.preventDefault();
        setVisibleAbout(true);
    }



    // Modal 3 (Export HTML)
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


    // Modal 4 (File Upload for database)
    //------------------------------------------
    const [importHTMLInfo, setImportHTMLInfo] = useState<string>('');
    const [visibleImportHTMLFile, setVisibleImportHTMLFile] = useState<boolean>(false);
    
    
    function handleOkImportHTMLFile() {
        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('IMPORT_DATABASE', false);
    }
    
    function handleCancelImportHTMLFile() {
        hideModalImportHTMLFile();
    }
    
    function showModalImportHTMLFile() {
        setVisibleImportHTMLFile(true);
    }
    
    function hideModalImportHTMLFile() {
        setVisibleImportHTMLFile(false);
    }    
    
    
    // Modal 5 (Update App)
    //------------------------------------------
    const [updateInfo, setUpdateInfo] = useState<any | null>(null);
    const [visibleUpdateApp, setVisibleUpdateApp] = useState<boolean>(false);



    // Button action of Windows (DOM element associated with preload.js)
    //------------------------------------------
    function minimizeFn() { 
        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('WINDOWS_BUTTON_MIN', false); 
    }
    function maximizeFn() { 
        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('WINDOWS_BUTTON_MAX', false); 
    }
    function quitFn() { 
        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('WINDOWS_BUTTON_CLOSE', false); 
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

            {/* Add buttons to app of Windows */}
            {!isMac ? (
                <nav id="title-bar">
                    <div id="titleshown"></div>
                    <div id="buttons">
                        <div id="minimize" onClick={minimizeFn}><span><svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg></span></div>
                        <div id="maximize" onClick={maximizeFn}><span><svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z"></path></svg></span></div>
                        <div id="quit" onClick={quitFn}><span><svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="#fff" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg></span></div>
                    </div>
                </nav>
            ) : ''}

            
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
                        <svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#d5d5d5" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg> Export HTML & DB</a>

                    <a href="#" onClick={showModalImportHTMLFile}>
                        <svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#d5d5d5" d="M512 48v288c0 26.5-21.5 48-48 48h-48V176c0-44.1-35.9-80-80-80H128V48c0-26.5 21.5-48 48-48h288c26.5 0 48 21.5 48 48zM384 176v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48h288c26.5 0 48 21.5 48 48zm-68 28c0-6.6-5.4-12-12-12H76c-6.6 0-12 5.4-12 12v52h252v-52z"></path></svg> Import Database</a>


                    <a href="#" className="app-name" onClick={showModalAbout}>About {appInfo ? appInfo.name : null}</a>
                    

                </>}
                contentArea={<>
                
                    <div className="content" style={{paddingTop: (!isMac ? "50px" : "20px")}}>

 
                        <div className="app-topbar">
                            <div className="left">
                                <div className="app-search__wrapper">
                                    <Search 
                                    value={inputSearch} 
                                    placeholder="Site Name or URL" 
                                    allowClear 
                                    onSearch={handleOkSearch}  
                                    onChange={handleInputSearchChange}
                                    onCompositionStart={handleInputSearchComposition}
                                    onCompositionUpdate={handleInputSearchComposition}
                                    onCompositionEnd={handleInputSearchComposition} 
                                    style={{ width:"325px" }} 
                                    />
                                </div>                                
                            </div>
                            <div className="right">
                                Total sites: <strong>{currentAllURLs.length}</strong>

                            </div>
                        </div>


                    
                        {dataURLs && dataURLs.length > 0 ? <>

                            <Group isSearch={isSearch} data={dataURLs} cat={dataCategories} callback={(res) => {
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
                        <p>Official Website: {appInfo ? <><a href={appInfo.website} target="_blank">Visit</a></> : null}</p>
                        <p>Current Version: {`${appInfo ? appInfo.version : null}`}</p>
                    </Modal>

                    <Modal
                        title="Update Available"
                        centered
                        closable={false}
                        visible={visibleUpdateApp}
                        okText="OK"
                        cancelText="Cancel"
                        onOk={() => setVisibleUpdateApp(false)}
                        onCancel={() => setVisibleUpdateApp(false)}
                        cancelButtonProps={{ shape: "round", style: { display: "none" } }}
                        okButtonProps={{ shape: "round" }}
                    >
                        <p>{updateInfo ? <>A newer version ({updateInfo.version}) of this app is available for download. Please update it from the <a href={updateInfo.website} target="_blank">official website</a>.<br /><Text type="warning"><strong>Important:</strong> Please export the <code style={{color:"orange"}}>.zip</code> data package, and restore the data after installing the new version.</Text></> : null}</p>
                    </Modal>



                    <Modal
                        title="Export HTML & DB"
                        visible={visibleExportHTMLFile}
                        onOk={showModalExportHTMLFile}
                        onCancel={handleCancelExportHTMLFile}
                        cancelButtonProps={{ shape: "round" }}
                        okButtonProps={{ shape: "round" }}
                        footer={[
                            <Button className="app-export-modalbtn" key="back" shape="round" onClick={handleCancelExportHTMLFile}>
                                Cancel
                            </Button>,
                            <Button className="app-export-modalbtn" key="submit" type="primary" shape="round" loading={loadingExportHTMLFile} onClick={handleOkExportHTMLFile}>
                                Export
                            </Button>,
                        ]}
                    >
                        <p>{exportHTMLInfo && exportHTMLInfo !== '' ? <><svg aria-hidden="true" style={{verticalAlign:"middle"}} height="16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="green" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg> Package <strong style={{ color: "green" }}>{exportHTMLInfo}</strong> exported successfully, please check your computer desktop.</> : 'Export an HTML file package and a Database that you can use directly in any operating system\'s browser.'}</p>
                    </Modal>


                    <Modal
                        title="Import Database"
                        visible={visibleImportHTMLFile}
                        onOk={showModalImportHTMLFile}
                        onCancel={handleCancelImportHTMLFile}
                        cancelButtonProps={{ shape: "round" }}
                        okButtonProps={{ shape: "round" }}
                        footer={[
                            <Button className="app-import-modalbtn" key="back" shape="round" onClick={handleCancelImportHTMLFile}>
                                Cancel
                            </Button>,
                            <Button className="app-import-modalbtn" key="submit" type="primary" shape="round" onClick={handleOkImportHTMLFile}>
                                Import Zip
                            </Button>,
                        ]}
                    >
                        <p>{importHTMLInfo && importHTMLInfo !== '' ? <><svg aria-hidden="true" style={{verticalAlign:"middle"}} height="16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="green" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg> <strong style={{ color: "green" }}>Data restored successfully, please restart your app.</strong></> : <>{'File Upload for database. It must be a '}<code style={{color:"orange"}}>.zip</code> {'file containing HTML imported by the app.'}</>}</p>
                    </Modal>

                </>}
            />


        </>
    );
}

