import React from "react";
import { Button, Upload, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const Uploader = ({
  fileList,
  onFileListChange,
}: {
  fileList: UploadFile[];
  onFileListChange: (arr: UploadFile[]) => void;
}) => {
  const onRemove = (file: UploadFile) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    onFileListChange(newFileList);
  };
  const beforeUpload = (file: UploadFile) => {
    onFileListChange([file]);

    return false;
  };

  return (
    <Upload fileList={fileList} onRemove={onRemove} beforeUpload={beforeUpload} maxCount={1}>
      <Button icon={<UploadOutlined />}>Select File</Button>
    </Upload>
  );
};

export default Uploader;
