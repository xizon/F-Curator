/* 
 *************************************
 * <!-- Welcome -->
 *************************************
 */
import React from 'react';

import './styles/index.scss';


type WelcomeProps = {
  hide?: boolean;
};
type WelcomeState = false;

export default function Welcome(props: WelcomeProps) {

  const {
    hide,
    ...attributes
  } = props;

  return (
    <>

      <div className="app-welcome"><div></div></div>

    </>
  )

}
