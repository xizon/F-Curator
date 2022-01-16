/* 
 *************************************
 * <!-- AppInfo -->
 *************************************
 */
import React from 'react';

import './styles/index.scss';


type AppInfoProps = {
  showText?: any;
  link?: string;
  version?: string;
};
type AppInfoState = false;

export default function AppInfo(props: AppInfoProps) {

  const {
    showText,
    link,
    version,
    ...attributes
  } = props;

  return (
    <>

      <div className="app-callback">
        <div>{props.showText as string || ''}</div>
        {link ? (version ? <><a href={link || "#"} target="_blank">{version}</a></> : null) :(version ? <>{version}</> : null)}

      </div>


    </>
  )

}
