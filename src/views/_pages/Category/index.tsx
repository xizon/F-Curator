import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, Button, Table, Divider, Modal } from 'antd';
import { Link } from 'react-router-dom';
import uniqueArr from '@/helpers/uniqueArr';
import Layout from '@/components/Layout';

import 'antd/dist/antd.css'; 


// for table
const columns = [
    {
        title: 'Sort',
        dataIndex: 'sort',
        width: 55,
        className: 'drag-visible',
        render: () => <>
        <svg style={{marginLeft:"12px"}} aria-hidden="true" height="15" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#ccc" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path></svg></>,
    },
    {
        title: 'Display Order',
        width: 120,
        dataIndex: 'id',
    },
    {
        title: 'Categories',
        dataIndex: 'category',
    },
    {
        title: 'Action',
        width: 80,
        dataIndex: 'action',
        render: (text, record) => (
            <a className="app-deletebtn-cat" data-name={record.category}>
            <svg style={{transform:"translateX(20px)"}} aria-hidden="true" height="15" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#c1c1c1" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg></a>
        ),
    }

];

// for electron
const { ipcRenderer } = window.require('electron');
let resCategories: any[] = [];

// Avoid EventEmitter memory leak detected
ipcRenderer.setMaxListeners(Infinity);



export default function Category() {


    // Form and Table
    //------------------------------------------
    const [appCatForm] = Form.useForm();
    const [dataTable, setDataTable] = useState<any[]>([]);

    
    function onFinish(values: any) {
        appCatForm.resetFields();

        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('DATA_UPDATED_CATEGORIES', values.catname);

        // Remove event to action buttons
        removeBtnEvents();

        console.log('Success:', values);
    }

    function onFinishFailed(errorInfo: any){
        console.log('Failed:', errorInfo);
    }

    function removeBtnEvents() {
        Array.prototype.slice.call( document.querySelectorAll( '.app-deletebtn-cat' ) ).forEach( (btn) => {
            btn.removeEventListener("click", deleteConfirm);
        });
    }


    function updateTableData( arr ) {
        // Update data of table
        const originData: any[] = [];
        for (let i = 0; i < arr.length; i++) {
            originData.push({
                "key": i,
                "id": i+1,
                "category": arr[i]
            });
        }
        setDataTable(originData);    

        Promise.resolve()
        .then(() => { 
            setDataTable(originData)
        })
        .then(() => {
            
            // Remove event to action buttons
            removeBtnEvents();

            // Add event to action buttons
            Array.prototype.slice.call( document.querySelectorAll( '.app-deletebtn-cat' ) ).forEach( (btn) => {
                btn.addEventListener("click", deleteConfirm);
                btn.currentName = btn.dataset.name;
                btn.categories = arr;
            });


            // At least one category is required, disabling the last delete button
            if (arr.length === 1) {
                const lastDeleteBtn = document.querySelector( '.app-deletebtn-cat' ) as HTMLAnchorElement;
                (lastDeleteBtn.querySelector( 'svg > path' ) as SVGPathElement).style.fill = '#dbdbdb';
                lastDeleteBtn.style.cursor = 'not-allowed';
                lastDeleteBtn.removeEventListener("click", deleteConfirm);
            }
        });
        

        
    }


    function updateData() {

        // Unregister from ipcRenderer.on event listener
        ipcRenderer.removeAllListeners('INITIALIZE_DATA');

        // Receiving on main process
        ipcRenderer.on('INITIALIZE_DATA', (event, curData) => {
            

            // Categories
            //------------------
            // Initialize the database
            resCategories = curData.categories;
            
            //update data
            resCategories.push( curData.categories );

            let _resCategories = uniqueArr(resCategories);
            _resCategories.splice(-1,1); //remove the first empty item

            console.log( '_resCategories: ', _resCategories);
            
            
            // Update data of table
            updateTableData(_resCategories);
            

        });

    }


    // Sort Items
    //------------------------------------------

    //drag & drop
    const placeholder = document.createElement('tr');
    placeholder.className = 'is-sortable is-placeholder';
    placeholder.style.backgroundColor = 'rgb(249, 250, 232)';
    placeholder.innerHTML = `
    <td class="ant-table-cell drag-visible">
        <svg style="visibility:hidden" aria-hidden="true" height="15" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="margin-left: 12px;">
            <path fill="#ccc" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
        </svg>
    </td>
    <td class="ant-table-cell"></td>
    <td class="ant-table-cell"></td>
    <td class="ant-table-cell"></td>
    `;


    let draggedObj: any = null;
    let overObj: any = null;


    function addIdsToData( target ) {
        target.map((item, index) => {
            item.id = index;
        });
    }

    const dragOver = useCallback((e: any) => {
        e.preventDefault();

        draggedObj.style.display = "none";
        
        if (e.target.classList.contains('is-placeholder')) return;

        const rowsWrapper = e.target.closest( '.ant-table-tbody' );
        if ( rowsWrapper !== null ) {
            overObj = e.target.closest( 'tr' );
            rowsWrapper.insertBefore(placeholder, overObj);
        }

    }, [dataTable]);
    

    const dragStart = useCallback((e: any) => {
        draggedObj = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', draggedObj);
    }, [dragOver]);

    const dragEnd = useCallback((e: any) => {

        draggedObj.style.display = 'block';
        draggedObj.parentNode.removeChild(placeholder);

        // update state
        let curData: any[] = [];
        curData = JSON.parse(JSON.stringify(dataTable));
        let from = Number(draggedObj.dataset.id);
        let to = Number(overObj.dataset.id);
        if (from < to) to--;


        // add IDs to data
        addIdsToData( curData );

        //sort JSON
        const dataIds = [];
        const newData = [];

        curData.map((item, index) => {
            dataIds.push(item.id as never)
        });
        console.log('--> data1:', dataIds, ' | ', curData);

        dataIds.splice(to, 0, dataIds.splice(from, 1)[0]);

        for (let i = 0; i < dataIds.length; i++) {
            for (let j = 0; j < dataIds.length; j++) {

                if (dataIds[i] === curData[j].id) {
                    newData.push(curData[j] as never);
                }
            }
        }
        

        console.log("--> data2: ", dataIds, ' | ', newData);
 
        // Get all categories
        const allCategories = Object.values(newData).map( (obj: any) => {
            return obj.category;
        });   

        // Communicate asynchronously from a renderer process to the main process.
        ipcRenderer.send('DATA_UPDATED_SORTED_CATEGORIES', allCategories);

        // Update data of table
        updateTableData(allCategories);


    }, [dataTable]);


    const DraggableBodyRow = ({ className, style, ...restProps }) => {
        return <tr draggable={true} onDragOver={(e) => dragOver(e)} onDragEnd={(e) => dragEnd(e)} onDragStart={(e) => dragStart(e)} className="is-sortable" data-id={restProps['data-row-key']-1} {...restProps} />;
    };

    

    // Delete Confirm
    //------------------------------------------
    function deleteConfirm(e) {
        e.preventDefault();

        const targetName = e.currentTarget.currentName;
        const categories = e.currentTarget.categories;
      
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

                const deleteTarget = categories.indexOf( targetName );
                if (deleteTarget !== -1) {
                    categories.splice(deleteTarget, 1);
                }

                // Update data of table
                updateTableData(categories);  

                // Communicate asynchronously from a renderer process to the main process.
                ipcRenderer.send('DATA_UPDATED_SORTED_CATEGORIES', categories);
                ipcRenderer.send('DATA_UPDATED_CATEGORIES', false);
                        

                
            }
        });
    }

    //------------------------------------------
    useEffect(() => {

        // Receiving on main process
        updateData();

        return () => {

            // Remove event to action buttons
            removeBtnEvents();

            // Communicate asynchronously from a renderer process to the main process.
            ipcRenderer.send('DATA_UPDATED_URLS', false);
            ipcRenderer.send('GET_APP_INFO', false);
            
        };

    }, []); // Empty array ensures that effect is only run on mount and unmount


    return (
        <>
            <Layout
                logo="assets/images/main/side-logo-white.png"
                secondaryBtnArea={<>
                    <Link to="/" exact><svg aria-hidden="true" height="10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#8f8f8f" d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"></path></svg> Back</Link>

                </>}
                contentArea={<>
                    <div className="content">

                        <Form
                        form={appCatForm}
                        labelCol={{ flex: '110px' }}
                        labelAlign="left"
                        labelWrap
                        wrapperCol={{ flex: 1 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        
                        >
                            <Form.Item
                                name="catname"
                                rules={[{ required: true, message: 'Please input your Category Name!' }]}
                            >
                                <Input placeholder="Category Name" style={{width:"325px"}} />
                            </Form.Item>

                            <Form.Item>
                                <Button shape="round" type="primary" htmlType="submit">
                                Add new
                                </Button>
                            </Form.Item>
                        </Form>      


                        <Divider />
                        
                        <Table
                            bordered
                            pagination={false}
                            columns={columns}
                            dataSource={dataTable}
                            scroll={{ y: 500 }}
                            rowKey="id"
                            components={{
                                body: {
                                    row: DraggableBodyRow
                                },
                            }}
                        />

                    </div>    

                </>}
            />


        </>
    );
}

