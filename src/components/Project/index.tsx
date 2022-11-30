/* 
 *************************************
 * <!-- Project -->
 *************************************
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Row } from 'antd';
import Item from './Item';

import 'antd/dist/antd.css';
import './styles/index.scss';



type ProjectFnType = (arg1: number) => void;

type ProjectProps = {
    /** Specify data of URL as a JSON string format. (can be classified data)
     * Such as: `[{"title":"Title","link":"https://example.com","icon":"https://x.jpg"},{"title":"Title","link":"https://example.com","icon":"https://x.jpg"}]` */
    data?: any[any];
    /** Classified Map-Data */
    classifiedMapData?: any;
    /** Current category name */
    catName?: string;
    /** The method to call when a page is clicked. Exposes the current data as an argument. */
    callback?: ProjectFnType | any;
     /** Determine whether it is the result of the search filter */
     isSearch?: boolean;
};

export default function Project(props: ProjectProps ) {

    const {
        data,
        classifiedMapData,
        catName,
        callback,
        isSearch
    } = props;


    const [rendererData, setRendererData] = useState<any[]>([]);

    //drag & drop
    const placeholder = document.createElement('div');
    const placeholderChild = document.createElement('div');
    const placeholderChildContent = document.createElement('div');
    placeholderChildContent.innerHTML = '.';
    placeholder.className = "ant-col ant-col-6 ant-col-xs-24 ant-col-md-12 ant-col-lg-6 ant-col-xl-4 ant-col-xxl-4 is-placeholder";
    placeholder.style.paddingLeft = '8px';
    placeholder.style.paddingRight = '8px';
    placeholderChild.className = "ant-card";
    placeholderChildContent.className = "ant-card-body";
    placeholderChild.appendChild(placeholderChildContent);
    placeholder.appendChild(placeholderChild);



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

        const itemsWrapper = e.target.parentNode;
        if (itemsWrapper.className === 'ant-row') {
            overObj = e.target;
            itemsWrapper.insertBefore(placeholder, overObj);
        }

    }, [rendererData]);
    

    const dragStart = useCallback((e: any) => {
        draggedObj = e.currentTarget;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', draggedObj);

        [].slice.call( draggedObj.closest( '.app-group' ).querySelectorAll( '.app-preview-link' ) ).forEach( (el: any) => {
            el.classList.add( 'is-dragging' );
        });
     

    }, [dragOver]);

    const dragEnd = useCallback((e: any) => {

        draggedObj.style.display = 'block';
        draggedObj.parentNode.removeChild(placeholder);

        [].slice.call( draggedObj.closest( '.app-group' ).querySelectorAll( '.app-preview-link' ) ).forEach( (el: any) => {
            el.classList.remove( 'is-dragging' );
        });

        // update state
        let curData: any[] = [];
        curData = JSON.parse(JSON.stringify(rendererData));
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


        // Reorganize all data
        let allData: any[] = [];

        if ( classifiedMapData ) {
            // Update the currently sorted list of a single category 
            classifiedMapData.set(catName, newData);

            // Deconstructs all data from `classifiedMapData` and  
            // merges sorted data of a single category 
            const newDataSorted = [];
            classifiedMapData.forEach(function(value, key) {
                value.forEach(function(item) {
                    newDataSorted.push(item as never);
                });
            });

            allData = newDataSorted;

        } else {
            // Sorting without category area
            allData = newData;

        }

        setRendererData(newData);


        // return to parent Component
        // Send all data to main process via ipcRenderer
        callback.call(null, allData);        


    }, [rendererData]);



    useEffect(() => {

        console.log('--> <Project> props.data: ',  data);
        setRendererData(data);
        
    }, [data]);  // A total of 2 runs before and after rendering


    return (
        <>

            <div className="app-project">

                <Row gutter={16} onDragOver={(e) => dragOver(e)}>
                    {rendererData && rendererData.length > 0 ? rendererData.map((item, index) => {
                        return <Item
                            data={rendererData}
                            classifiedMapData={classifiedMapData}
                            catName={catName}
                            key={index}
                            title={item.title}
                            link={item.link}
                            icon={item.icon}
                            data-id={index}
                            draggable={isSearch ? false : true}  // Prevent drag sorting 
                            evDragEnd={(e) => dragEnd(e)}
                            evDragStart={(e) => dragStart(e)}
                        />;
                    }) : ''}
                </Row>

            </div>


        </>
    )

}

