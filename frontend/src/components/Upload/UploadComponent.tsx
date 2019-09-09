import { message, Row, Upload } from 'antd';
import { Icon } from 'components/Assets';
import { IconValue } from 'components/Assets/Icon';
import { Button } from 'components/Button';
import { P } from 'components/Typo';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const Dragger = Upload.Dragger;

const getBase64 = (file: any, callback: (textContent: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(`${reader.result}`));
  reader.readAsText(file);
};

const beforeUpload = (file: File) => {
  const isText = file.type === 'text/plain';
  if (!isText) {
    message.error('You can only upload a text file!');
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Image must smaller than 5MB!');
  }
  return isText && isLt5M;
};

const dummyRequest = ({ file, onSuccess }: { file: any; onSuccess: any }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};

const uploadProps = {
  customRequest: dummyRequest,
  multiple: false,
  name: 'file',
  showUploadList: false,
};

interface IProps {
  onFileChange: (textContent: string) => void;
}

interface IState {
  loading: boolean;
  textContent: string;
}

class UploadComponent extends React.PureComponent<IProps, IState> {
  state = {
    loading: false,
    textContent: '',
  };

  componentWillMount() {}

  handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      getBase64(
        info.file.originFileObj,
        (textContent: string): void => {
          this.setState(
            {
              loading: false,
              textContent,
            },
            () => {
              const { onFileChange } = this.props;
              onFileChange(textContent);
            },
          );
        },
      );
    }
  };

  render() {
    return (
      <div className="simulator upload-component">
        <Dragger
          {...uploadProps}
          beforeUpload={beforeUpload}
          onChange={this.handleChange}
        >
          <Row justify="center">
            {this.state.textContent ? (
              <textarea cols={50} rows={8} value={this.state.textContent} />
            ) : (
              <>
                <Row type="flex" justify="center">
                  <Icon value={IconValue.CloudUpload} className="upload-icon" />
                </Row>
                <Row type="flex" justify="center" className="drop-title">
                  <FormattedMessage id="simulator.new.hdl.drop.title" />
                </Row>
                <Row type="flex" justify="center" className="drop-description">
                  <FormattedMessage id="simulator.new.hdl.drop.description1" />
                </Row>
                <Row type="flex" justify="center" className="drop-description">
                  <FormattedMessage id="simulator.new.hdl.drop.description2" />
                </Row>
              </>
            )}
          </Row>
        </Dragger>
        <Row type="flex" justify="center">
          <Upload
            {...uploadProps}
            beforeUpload={beforeUpload}
            onChange={this.handleChange}
          >
            <Button
              icon={<Icon value={IconValue.Plus} />}
              className="btn-hdl-add"
            >
              <FormattedMessage id="simulator.new.hdl.btn.add" />
            </Button>
          </Upload>
        </Row>
      </div>
    );
  }
}

export default UploadComponent;
