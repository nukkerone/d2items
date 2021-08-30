class ReadableManager {
  props = null;
  propsEntries = [];
  readableProps = [];
  propsStrategies = {};

  constructor(item) {
    // I want an object with just props, nothing else
    this.props = getPropsOnly(item);
    this.propsEntries = Object.entries(this.props);
    this.readableProps = [];
  }

  getPropsOnly(item) {
    let props = {};
    for (const prop in item) {
      let match = prop.match(propRegex);
      match = match && match.length > 0 ? match[0] : null;
      if (match) { props[prop] = item[prop] }
    }
    return props;
  }

  generate() {
    for (const prop in item) {
      
    }
  }

}


class ReadableMapper {

  props;

  constructor(props) {
    this.props = { ...props };
  }

  map(props) {
    this.props = { ...props };

    return {
      readableProp: '',
      propsUsed: []
    }
  }
}