import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, Col, Modal, Space, Input, Select } from 'antd';
import isValidHttpUrl from '@/helpers/isValidHttpUrl';

import 'antd/dist/antd.css';

const { Option } = Select;

// for electron
const { ipcRenderer } = window.require('electron');

// Avoid EventEmitter memory leak detected
ipcRenderer.setMaxListeners(Infinity);


// Get index of JSON Array
function getIndexOf(arr, key, val) {
    for (let i=0; i<arr.length; i++) {
        if( arr[i][key].toString() === val.toString() ){
            return i;
        }
    }
    return -1;
}


// Reorganize all data
function reorganizeAllData(mapData, currentCatData, catName) {
    let res: any[] = [];

    if ( mapData ) {
        // Update the currently sorted list of a single category 
        mapData.set(catName, currentCatData);

        // Deconstructs all data from `mapData` and  
        // merges sorted data of a single category 
        const newDataSorted = [];
        mapData.forEach(function(value, key) {
            value.forEach(function(item) {
                newDataSorted.push(item as never);
            });
        });

        res = newDataSorted;

    } else {
        // Sorting without category area
        res = currentCatData;

    }

    return res;
}


type ItemProps = {
    data?: any[any];
    classifiedMapData?: any;
    catName?: string;
    title?: string;
    link?: string;
    icon?: string;
    draggable?: boolean;
    evDragEnd?: (option: any) => void | undefined;
    evDragStart?: (option: any) => void | undefined;
};


export default function Item(props: ItemProps) {

    const {
        data,
        classifiedMapData,
        catName,
        title,
        link,
        icon,
        draggable,
        evDragEnd,
        evDragStart,
        ...attributes
    } = props;

    const _icon = typeof (icon) === 'undefined' ? false : icon;


    // Delete Confirm
    //------------------------------------------
    const deleteConfirm = useCallback(
        (paramLink) => (e) => {
            e.preventDefault();

            console.log('--> deleteConfirm data: ', data);

            Modal.confirm({
                title: '',
                icon: <>
                    <svg aria-hidden="true" width="25" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="#faad14" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>
                </>,
                content: 'Are you sure?',
                okText: 'Confirm',
                cancelText: 'Cancel',
                cancelButtonProps: { shape: "round" },
                okButtonProps: { shape: "round" },
                onOk: () => {

                    const newData = data;
                    const deleteTarget = getIndexOf(newData, 'link', paramLink);
                    if (deleteTarget !== -1) {
                        newData.splice(deleteTarget, 1);
                    }

                    // Reorganize all data
                    const allData: any[] = reorganizeAllData(classifiedMapData, newData, catName);

                    // Communicate asynchronously from a renderer process to the main process.
                    ipcRenderer.send('DATA_UPDATED_SORTED_URLS', allData);
                    ipcRenderer.send('DATA_UPDATED_URLS', false);


                }
            });
        }, [data]); // Get the latest data to avoid sorting not updated in real time when deleted item



    // Form (Edit)
    //------------------------------------------
    const refInputUrl = useRef<any>(null);
    const refInputTitle = useRef<any>(null);

    const [dataCategories, setDataCategories] = useState<any[]>([]);
    const [category, setCategory] = useState<string>();
    const [inputTitle, setInputTitle] = useState<string>('');
    const [inputUrl, setInputUrl] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    
    const [editIndex, setEditIndex] = useState<number>(0);

    

    function showModalEdit( cat, title, link ) {
        setVisible(true);

        //update item info
        setInputTitle(title);
        setInputUrl(link);
        setCategory(cat);

        //update current item index
        const editTarget = getIndexOf(data, 'link', link);
        setEditIndex(editTarget);

    }

    function handleOkEdit() {

        const _url = refInputUrl?.current?.input.value;
        const _title = refInputTitle?.current?.input.value;
        const _cat = category;

        const newData = data;
        if (editIndex !== -1) {
            newData[editIndex].category = _cat;
            newData[editIndex].link = _url;
            newData[editIndex].title = _title;
        }
  
        // Reorganize all data
        const allData: any[] = reorganizeAllData(classifiedMapData, newData, catName);

        if (isValidHttpUrl(_url)) {
            // Communicate asynchronously from a renderer process to the main process.
            ipcRenderer.send('DATA_UPDATED_SORTED_URLS', allData);
            ipcRenderer.send('DATA_UPDATED_URLS', false);
            setVisible(false);
        }

    }

    function handleCancelEdit() {
        setVisible(false);
    }


    function handleSelectEdit(value) {
        setCategory(value);
    }

    function handleInputTitle(e) {
        setInputTitle(e.target.value);
    }

    function handleInputUrl(e) {
        setInputUrl(e.target.value);
    }
 
  
    
        

    //------------------------------------------
    useEffect(() => {

        // Update categories
        setDataCategories( Array.from( classifiedMapData.keys() ) );


    }, []); 



    return (
        <>

            <Modal
                title="Edit"
                visible={visible}
                onOk={handleOkEdit}
                okText="Confirm"
                cancelText="Cancel"
                onCancel={handleCancelEdit}
                cancelButtonProps={{ shape: "round" }}
                okButtonProps={{ shape: "round" }}
            >
                <Input.Group compact style={{ textAlign: "left" }}>
                    <Space direction="vertical">
                        <Input placeholder="Site Name" id="app-input-title" ref={refInputTitle} style={{ width: "325px" }} value={inputTitle} onChange={handleInputTitle} /><br />
                        <Input placeholder="https://" id="app-input-url" ref={refInputUrl} style={{ width: "325px" }} value={inputUrl} onChange={handleInputUrl} /> <span style={{ color: "red", fontSize: "14px", position: "absolute", marginTop: "-23px", left: "310px" }}>*</span><br />
                        <Select
                            style={{ minWidth: "150px" }}
                            onChange={handleSelectEdit}
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


            <Col draggable={draggable || false} onDragEnd={evDragEnd} onDragStart={evDragStart} span={6} xxl={4} xl={4} lg={6} md={12} xs={24} {...attributes}>
                <Card title={false} bordered={false}>
                    <a href={link || '#'} target="_blank" title={title || ''}>{_icon && _icon !== '' ? <><img style={{ borderRadius: "2px" }} src={_icon} /></> : <><svg aria-hidden="true" width="15" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg></>} {title || ''}</a>

                    <a className="app-deletebtn-project" onClick={deleteConfirm(link)}><svg aria-hidden="true" height="15" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#cbcbcb" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg></a>

                    <a className="app-editbtn-project" onClick={(e)=> showModalEdit(catName,title,link)}><svg aria-hidden="true" height="15" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="#cbcbcb" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg></a>



                </Card>

                <span className="app-preview-link">
                    {title || ''}
                    <em>{link}</em>
                </span>
            </Col>

        </>
    )

}

