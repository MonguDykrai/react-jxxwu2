import React from 'react';
import { Table, Modal } from 'antd';
import styles from './sortableTable.less';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import { MenuOutlined, CheckCircleFilled } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';
import CircleOutlined from '@/assets/imgs/CircleOutlined.png';

const DragHandle = sortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
));

const columns = [
  {
    title: '排序',
    dataIndex: 'px',
    className: styles['drag-visible'],
    render: () => <DragHandle />,
    width: 60,
  },
  {
    title: '从机名称',
    dataIndex: 'cjmc',
    width: 100,
  },
  {
    title: '设备编码',
    dataIndex: 'sbbm',
    width: 100,
  },
  {
    title: '单位',
    dataIndex: 'dw',
    width: 60,
  },
  {
    title: '从机IP',
    dataIndex: 'cjip',
    width: 130,
  },
  {
    title: '添加时间',
    dataIndex: 'tjsj',
    width: 120,
  },
  {
    title: '设为产线产量',
    dataIndex: 'swcxcl',
    render: (kVal, record) => getLineOutputRow(kVal, record),
    width: 120,
  },
];

// 设为产线产量单元格
function getLineOutputRow(kVal, record) {
  let style = { display: 'flex', alignItems: 'center', cursor: 'pointer' };
  let children = (
    <>
      <img src={CircleOutlined} style={{ width: 20 }} />
      <span>&nbsp;未设置</span>
    </>
  );
  if (kVal)
    children = (
      <>
        <CheckCircleFilled style={{ fontSize: 20, color: '#1890ff' }} />
        <span style={{ color: '#1890ff' }}>&nbsp;已设置</span>
      </>
    );
  return (
    <span style={style} onClick={() => setAsLineOutput(record)}>
      {children}
    </span>
  );
}

const data = [
  {
    key: 0,
    cjmc: 'PLC-210', // 从机名称
    // cjmc: 'PLC-2106666666666666666666', // 从机名称
    sbbm: '02513461', // 设备编码
    dw: '盒', // 单位
    // dw: '盒6666666', // 单位
    cjip: '255.255.198.123', // 从机IP
    tjsj: '2021-05-12', // 添加时间
    swcxcl: true, // 设为产线产量
    index: 0,
  },
  {
    key: 1,
    cjmc: 'PLC-210',
    sbbm: '02513461',
    dw: '箱',
    cjip: '255.255.198.123',
    tjsj: '2021-05-12',
    swcxcl: false,
    index: 1,
  },
];

const SortableItem = sortableElement((props) => <tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);

export default class SortableTable extends React.Component {
  state = {
    dataSource: data,
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { dataSource } = this.state;
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(
        [].concat(dataSource),
        oldIndex,
        newIndex
      ).filter((el) => !!el);
      console.log('Sorted items: ', newData);
      this.setState({ dataSource: newData });
    }
  };

  DraggableContainer = (props) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      onSortEnd={this.onSortEnd}
      lockAxis="y" // 不支持左右移动
      // lockAxis="x"
      // lockAxis="xy"
      {...props}
      helperClass={styles['row-dragging']}
    />
  );

  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const { dataSource } = this.state;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x) => x.index === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };

  render() {
    const { dataSource } = this.state;
    const { loading = false } = this.props; // 正在加载数据

    return (
      <Table
        loading={loading}
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        // rowKey="index" // 默认值为 key
        components={{
          body: {
            wrapper: this.DraggableContainer,
            row: this.DraggableBodyRow,
          },
        }}
      />
    );
  }
}

// 设为产线产量
function setAsLineOutput({ index }) {
  Modal.confirm({
    icon: <CheckCircleFilled style={{ color: '#72c140' }} />,
    title: '确认要将此设备产量设为产线产量吗？',
    content: '确认此操作后，从机所在产线产量统计将以此从机产量为准。',
    okText: '确定',
    onOk: () => {
      alert('ok');
      data.forEach((d) => {
        if (d.index === index) d.swcxcl = true; // 数据更新了，但视图没更新，需要调用 setState
      });
    },
    cancelText: '取消',
    onCancel: () => alert('cancel'),
    centered: true, // vertical align center
    bodyStyle: {}, // modal body style
    afterClose: () => alert('afterClose'), // Specify a function that will be called when modal is closed completely
  });
}
