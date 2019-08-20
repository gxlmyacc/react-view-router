import React from 'react';
import router from 'router';

class HomeMainOtherIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: 'text1' };
    console.log('HomeMainOtherIndex constructor');
  }

  render() {
    const { text } = this.state;
    return (
      <div>
        <h1>HomeMainOtherIndex</h1>
        { text }
        <button onClick={() => router.push('some')}>to some</button>
      </div>
    );
  }
}

export default HomeMainOtherIndex;
