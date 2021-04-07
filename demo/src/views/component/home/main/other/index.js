import React from 'react';
import router from 'router';

class HomeMainOtherIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
    console.log('HomeMainOtherIndex constructor');
  }

  goSome = () => {
    router.push({
      path: 'some',
      query: { aa: 1 }
    }, () => {
      console.log('router.push some is complete!');
    }, () => {
      console.log('router.push some is abort!');
    });
  }

  render() {
    const { text } = this.state;
    return (
      <div style={{ border: '1px solid yellow', padding: 10 }}>
        <h1>HomeMainOtherIndex</h1>
        { text }
        <button onClick={this.goSome}>to some</button> - router.push('some')
      </div>
    );
  }
}

export default HomeMainOtherIndex;
