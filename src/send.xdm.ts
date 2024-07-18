enum DataIncludeTypeEnum {
  INCLUDE = 1,
  EXCLUDE = 0
}

enum MemberValueTypeEnum { 
  STRING = 'string',
  TIMESTAMP = 'timestamp',
  NUMBER = 'number'
}
enum MemberFieldTypeEnum { 
  CAPTION = 'caption',
  NAME = 'name'
}

type MemberValueType = [
  start:{
    i: DataIncludeTypeEnum,  
    v: number | string,  //The value of the filter
  },
  end: {
    i: DataIncludeTypeEnum,  
    v: number | string,  
  }
] | string | number;

type XDMMessageDataType = {
  value: Array<MemberValueType>,
  name: string,
  type: MemberFieldTypeEnum,
  datatype: MemberValueTypeEnum
}

/* DEMO */
class XMDWorker {

    reportId:string|null;

    constructor({ onPageInitEvent = () => { } }) {
        this.reportId = null;
        window.addEventListener('message', (msg) => {
            const { data } = msg;
            let reportMessage;
            try { reportMessage = JSON.parse(data); } catch (d) { }
            if (reportMessage) {
                if (reportMessage.event == 'visualizerReportFileLoaded') {//This is the message of the report initialization completion. It will carry an id value, which is the unique identifier of the report. Subsequent messages should carry this id value, otherwise the report will not be processed.
                    this.reportId = reportMessage.id;
                    onPageInitEvent();
                }
            }
        });
    }

    /**
     * 
     * @param {Array} data  MessageData
     * @param {Window} target  Visualizer iframe window
     * @param {Boolean} init   Whether this messagedata is for the first query
     * @returns 
     */
    send(data:Array<XDMMessageDataType>, target:Window, init:boolean = false) {
        if (!this.reportId) {
            return;
        }
        const message = {
            trustMark: this.reportId,
            event: 'query',
            init,
            filters: data,
        };
        target?.postMessage(JSON.stringify(message), '*');
    }

}

export default XMDWorker;
export type {XDMMessageDataType, MemberValueType};
export {DataIncludeTypeEnum, MemberValueTypeEnum, MemberFieldTypeEnum};