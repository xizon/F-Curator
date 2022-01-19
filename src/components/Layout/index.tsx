/* 
 *************************************
 * <!-- Layout -->
 *************************************
 */
import React from 'react';

import './styles/index.scss';


type LayoutProps = {
   /** Set brand. */
   logo?: string;
	 /** Set the primary button area the way of HTML Element. */
	 primaryBtnArea?: React.ReactNode;
	 /** Set the secondary button area the way of HTML Element. */
	 secondaryBtnArea?: React.ReactNode;
	 /** Set the content area the way of HTML Element. */
	 contentArea?: React.ReactNode;
};
type LayoutState = false;

export default function Layout(props: LayoutProps) {

  const {
    logo,
    primaryBtnArea,
    secondaryBtnArea,
    contentArea
  } = props;

  return (
    <>

      <div className="app-content__wrapper">
          {primaryBtnArea || null}
          <div className="content__sidebar">
              <div className="panel-dragarea">
              </div>
              <div className="panel-center">
              </div>
              <div className="board">
                   {logo ? <><div className="brand"><img src={logo} /></div></> : null}
                  <div className="secondary-btn">
                      {secondaryBtnArea || null} 
                  </div>
              </div>

          </div>
          <div className="content-area">
           {contentArea || null} 
          </div>
      </div>

    </>
  )

}
