import React, {useEffect, useRef } from 'react';
import './App.css';
import dayjs from 'dayjs';
import Panel, {type PanelSelectedProps} from './Panel';

import XDMWorker, {packageDaterangeMessage, packageNormalMessage} from './send.xdm';

const ctrlParams = [ 
  `__xdmTimeout=150` //Waiting time for init control message send to iframe, unit: ms
];

// The address of the report to be embedded
const reportAddr = `https://aws.datafor.com.cn:448/datafor/plugin/datafor/api/share/open?shareid=Z0ZrY1g2XGDqY1kxKIDxeI2`;

/**
 * 
 * Parameter name must be consistent with the uniqueName of the level in the report analysis model
 * You can pick up the uniqueName of the level in the report analysis model by using the browser's developer tool 
 * 
 * For example, when the report loads, a api request name `/plugin/datafor/api/cube/discover/{XXX}/metadata` in the network tab of the developer tool will be sent.
 * You can find the uniqueName of the level in the response data of the request.
 * 
 */
const PARAMETERNAME = {
  productFamily: '[product_class].[hierarchy_product_family].[product_family]',
  date: '[time_by_day].[AGG_the_date].[the_date@@DAYS]' 
}

 
/**
 * Initial filter criteria. 
 * 
 * This set of default values will determine the initial state of the panel.
 *
 * You can also send them to the report through the send method in the onPageInitEvent method of the XDMWorker instance, 
 * so that the report can filter the data when it loads for the first time.
 */
const defaults = {
  family: ['Non-Consumable'], 
  date: {
    start: dayjs('1997-3-5').startOf('date').valueOf(), 
    end: dayjs('1997-3-20').endOf('date').valueOf() 
  }
}

const encodeQueryString = (data:PanelSelectedProps) =>{
  const { family: p, date: d } = data;
  return [
    ...packageDaterangeMessage(PARAMETERNAME.date, [[{ i: 1, v: d.start.valueOf() }, { i: 1, v: d.end.valueOf() }]]), 
    ...packageNormalMessage(PARAMETERNAME.productFamily, [...p])
  ]; 
};


function App():JSX.Element {
  const iframeRef = React.createRef<HTMLIFrameElement>();
  const xdm = useRef<XDMWorker>();  
  useEffect(() => {
    xdm.current = new XDMWorker({
      onPageInitEvent: () => xdm?.current?.send(encodeQueryString(defaults), iframeRef?.current?.contentWindow as Window, true)
    });
    return () => xdm.current?.destroy();
  });

  return (
      <div className="App">
        <Panel 
          familiesList={['Drink', 'Food', 'Non-Consumable']} 
          defaults={{...defaults}} 
          onCommit={(msg: PanelSelectedProps) => {
            xdm?.current?.send(encodeQueryString(msg), iframeRef?.current?.contentWindow as Window);
          }}
        />
        <div className="content">
          <iframe src={`${reportAddr}&${ctrlParams.join('&')}`} title="demo_xdm" width="100%" height="100%" frameBorder="0" ref={iframeRef}></iframe>
        </div>
      </div>
    );
};

export default App;
