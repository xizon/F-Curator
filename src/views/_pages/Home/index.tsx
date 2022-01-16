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

// for electron
const { ipcRenderer } = window.require('electron');
let resURLs: any[] = [];
let resCategories: any[] = [];

// Avoid EventEmitter memory leak detected
ipcRenderer.setMaxListeners(Infinity);


export default function Home() {

    const refInputUrl = useRef<any>(null);
    const refInputTitle = useRef<any>(null);

    const [dataURLs, setDataURLs] = useState<any[]>([]);
    const [dataCategories, setDataCategories] = useState<any[]>([]);
    const [appInfo, setAppInfo] = useState<any | null>(null);
    const [category, setCategory] = useState<string>();
    const [inputTitle, setInputTitle] = useState<string>('');
    const [inputUrl, setInputUrl] = useState<string>('');



    // Modal 1
    //------------------------------------------
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

    function showModal() {
        setVisible(true);

        //clear input and select
        resetInputField();

    }

    function handleOk() {
        sendData();
    }

    function handleSelect(value) {
        setCategory(value);
    }

    function handleInputTitle(e) {
        setInputTitle(e.target.value);
    }

    function handleInputUrl(e) {
        setInputUrl(e.target.value);
    }

    function resetInputField() {
        setInputTitle('');
        setInputUrl('');
    }

    function handleCancel() {
        setVisible(false);
    }

    function updateData() {

        // Unregister from ipcRenderer.on event listener
        ipcRenderer.removeAllListeners('INITIALIZE_DATA');
        ipcRenderer.removeAllListeners('APP_INFO');

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


    // Modal 2
    //------------------------------------------
    const [visibleAbout, setVisibleAbout] = useState(false);

    function showModalAbout(e) {
        e.preventDefault();
        setVisibleAbout(true);
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
                        <Button type="primary" size="large" shape="circle" onClick={showModal}>
                            <svg aria-hidden="true" height="25" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#fff" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>
                        </Button>
                    </div>

                </>}
                secondaryBtnArea={<>
                    <Link to="/category"><svg aria-hidden="true" height="12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#d5d5d5" d="M12.83 352h262.34A12.82 12.82 0 0 0 288 339.17v-38.34A12.82 12.82 0 0 0 275.17 288H12.83A12.82 12.82 0 0 0 0 300.83v38.34A12.82 12.82 0 0 0 12.83 352zm0-256h262.34A12.82 12.82 0 0 0 288 83.17V44.83A12.82 12.82 0 0 0 275.17 32H12.83A12.82 12.82 0 0 0 0 44.83v38.34A12.82 12.82 0 0 0 12.83 96zM432 160H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0 256H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg> Category Edit</Link>

                    <a href="#" onClick={showModalAbout}>About {appInfo ? appInfo.name : null}</a>

                </>}
                contentArea={<>


                    {dataURLs && dataURLs.length > 0 ? <>

                        <div className="content">

                            <Group data={dataURLs} cat={dataCategories} callback={(res) => {
                                console.log('--> update database: ', res);

                                res.map((item) => {
                                    delete item.id;
                                });

                                // Communicate asynchronously from a renderer process to the main process.
                                ipcRenderer.send('DATA_UPDATED_SORTED_URLS', res);

                            }} />


                        </div>

                    </> : <Welcome />}

                    <AppInfo showText={null} version={''} />


                    <Modal
                        title="Add New"
                        visible={visible}
                        onOk={handleOk}
                        okText="Confirm"
                        cancelText="Cancel"
                        confirmLoading={confirmLoading}
                        onCancel={handleCancel}
                        cancelButtonProps={{ shape: "round" }}
                        okButtonProps={{ shape: "round" }}
                    >
                        <Input.Group compact style={{ textAlign: "left" }}>
                            <Space direction="vertical">
                                <Input placeholder="Site Name" id="app-input-title" ref={refInputTitle} style={{ width: "325px" }} value={inputTitle} onChange={handleInputTitle} /><br />
                                <Input placeholder="https://" id="app-input-url" ref={refInputUrl} style={{ width: "325px" }} value={inputUrl} onChange={handleInputUrl} /> <span style={{ color: "red", fontSize: "14px", position: "absolute", marginTop: "-23px", left: "310px" }}>*</span><br />
                                <Select
                                    style={{ minWidth: "150px" }}
                                    onChange={handleSelect}
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



                </>}
            />


        </>
    );
}

