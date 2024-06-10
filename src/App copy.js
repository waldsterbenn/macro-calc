import "./App.css";
import React from "react";

const electron = window.require("electron");

const consumedStorageKey = "storedConsumedItems";
const isUlcStorageKey = "isUlc";
const saveDateStorageKey = "savedDate";

/**
 * !!!!!!!!!!!!!!!!!!
 * To start: npm run dev
 * !!!!!!!!!!!!!!!!!!
 */
function App() {
  return <MacroApp />;
}

export default App;

class MacroApp extends React.Component {
  constructor(props) {
    super(props);

    let currentDate = new Date();
    let storedDate = JSON.parse(localStorage.getItem(saveDateStorageKey));
    let savedDate = new Date(storedDate.savedDate);
    if (currentDate > savedDate) {
      localStorage.setItem(
        saveDateStorageKey,
        JSON.stringify({ savedDate: currentDate })
      );
    }

    this.state = {
      daysSelection: currentDate,
      lastAddedItemIndex: null,
    };

    this.handleGramsChanged = this.handleGramsChanged.bind(this);
    this.onItemAdded = this.handleOnItemAdded.bind(this);
    this.onItemRemoved = this.handleOnItemRemoved.bind(this);
  }

  async componentDidMount() {
    if (this.state.products && this.state.consumedItems) return;

    let products = await electron.ipcRenderer.invoke("readProducts");

    let consumedItems = [];

    const json = localStorage.getItem(consumedStorageKey);
    const storedConsumedItems = JSON.parse(json);
    if (storedConsumedItems !== null && storedConsumedItems.length !== 0) {
      storedConsumedItems.forEach((res) => {
        consumedItems.push(
          <ConsumedFoodRow
            key={consumedItems.length}
            name={res.name}
            grams={res.grams}
            products={products}
            onGramsChanged={this.handleGramsChanged}
            onItemRemoved={this.onItemRemoved}
            autoFocus={false}
          />
        );
      });
    }

    let totalFat = calculateTotal("fat", consumedItems, products);
    let totalProtein = calculateTotal("protein", consumedItems, products);
    let totalCarbs = calculateTotal("carbs", consumedItems, products);

    this.setState({
      totalFat: totalFat,
      totalProtein: totalProtein,
      totalCarbs: totalCarbs,
      consumedItems,
      products,
    });
  }

  saveChange(newList) {
    let items = [];
    newList.forEach((item) => {
      items.push({
        name: item.props.name,
        grams: item.props.grams,
      });
    });

    const json = JSON.stringify(items);
    localStorage.setItem(consumedStorageKey, json);
  }

  handleOnItemAdded(item) {
    const filteredItems = this.state.consumedItems.filter(
      (x) => x.props.name === item.name
    );
    if (filteredItems.length !== 0) {
      return;
    }

    let sd = (
      <ConsumedFoodRow
        key={this.state.consumedItems.length}
        name={item.name}
        grams={0}
        products={this.state.products}
        onGramsChanged={this.handleGramsChanged}
        onItemRemoved={this.onItemRemoved}
        autoFocus={true}
      />
    );

    let newList = [...this.state.consumedItems, sd];
    this.setState({
      consumedItems: newList,
    });
    this.saveChange(newList);
  }

  handleOnItemRemoved(productName) {
    const rows = [...this.state.consumedItems];
    let index = rows.findIndex((x) => x.props.name === productName);
    rows.splice(index, 1);
    this.setState({ consumedItems: rows });
    this.saveChange(rows);
  }

  handleGramsChanged(productName, grams) {
    const updatedItems = this.state.consumedItems.map((item) => {
      if (item.props.name === productName) {
        let sd = (
          <ConsumedFoodRow
            key={item.key}
            name={item.props.name}
            grams={grams}
            products={this.state.products}
            onGramsChanged={this.handleGramsChanged}
            onItemRemoved={this.onItemRemoved}
            autoFocus={false}
          />
        );
        return sd;
      } else {
        return item;
      }
    });

    this.setState({
      consumedItems: updatedItems,
      totalFat: calculateTotal("fat", updatedItems, this.state.products),
      totalProtein: calculateTotal(
        "protein",
        updatedItems,
        this.state.products
      ),
      totalCarbs: calculateTotal("carbs", updatedItems, this.state.products),
    });

    this.saveChange(updatedItems);
  }

  render() {
    if (this.state.products && this.state.consumedItems) {
      return (
        <div className="App">
          <span>{this.state.daysSelection.toDateString()}</span>
          <DayTable
            products={this.state.products}
            consumedItems={this.state.consumedItems}
            daysSelection={this.state.daysSelection}
            totalFat={this.state.totalFat}
            totalProtein={this.state.totalProtein}
            totalCarbs={this.state.totalCarbs}
            onNewItemAdded={this.state.newlyAddedItem}
          />
          <FilterableProductTable
            products={this.state.products}
            onItemAdded={this.onItemAdded}
          />
        </div>
      );
    } else {
      return <h1>Loading user data</h1>;
    }
  }
}

class DayTable extends React.Component {
  constructor(props) {
    super(props);

    let iul = JSON.parse(localStorage.getItem(isUlcStorageKey));
    this.state = {
      isUlc: iul,
    };
    this.handleIsUlcChange = this.handleIsUlcChange.bind(this);
  }

  handleIsUlcChange(newVal) {
    let checked = newVal.target.checked;
    this.setState({
      isUlc: checked,
    });
    localStorage.setItem(isUlcStorageKey, JSON.stringify({ isUlc: checked }));
  }

  render() {
    if (this.props.products && this.props.consumedItems) {
      return (
        <div data-tid="container" className="app-table">
          <table className="table striped bordered hover">
            <tbody>
              <tr>
                <th>Goal</th>
                <th>
                  <input
                    className="checkbox"
                    type="checkbox"
                    checked={this.state.isUlc}
                    onChange={this.handleIsUlcChange}
                  />{" "}
                  ULC
                </th>
                <th>
                  {this.props.totalProtein - (this.state.isUlc ? 150 : 225)}
                </th>
                <th>{this.props.totalFat - (this.state.isUlc ? 154 : 125)}</th>
                <th>{this.props.totalCarbs - (this.state.isUlc ? 30 : 262)}</th>
                <th></th>
              </tr>
              <tr>
                <th>Name</th>
                <th>Grams</th>
                <th>Protein:{this.props.totalProtein}</th>
                <th>Fat:{this.props.totalFat}</th>
                <th>Carbs:{this.props.totalCarbs}</th>
                <th></th>
              </tr>

              {this.props.consumedItems}
            </tbody>
          </table>
        </div>
      );
    } else {
      return <h1>Loading products</h1>;
    }
  }
}

function calculateTotal(type, consumedItems, products) {
  var sum = 0;
  for (let i = 0; i < consumedItems.length; i++) {
    const item = consumedItems[i];
    const product = products.filter((x) => x.name === item.props.name)[0];

    if (type === "fat") sum += product.macrosPrHundred.fat * item.props.grams;
    else if (type === "protein")
      sum += product.macrosPrHundred.protein * item.props.grams;
    else if (type === "carbs")
      sum += product.macrosPrHundred.carbs * item.props.grams;
  }

  return Math.ceil(sum);
}

class FilterableProductTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: "",
      ulcOnly: false,
    };
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    this.handleUlcOnlyChange = this.handleUlcOnlyChange.bind(this);
    this.onItemAdded = this.handleOnItemAdded.bind(this);
  }

  handleOnItemAdded(item) {
    this.props.onItemAdded(item);
  }

  handleFilterTextChange(filterText) {
    this.setState({
      filterText: filterText,
    });
  }

  handleUlcOnlyChange(ulcOnly) {
    this.setState({
      ulcOnly: ulcOnly,
    });
  }

  render() {
    return (
      <div className="app-table">
        <div className="search-bar">
          <SearchBar
            products={this.props.products}
            filterText={this.state.filterText}
            ulcOnly={this.state.ulcOnly}
            onFilterTextChange={this.handleFilterTextChange}
            onUlcOnlyChange={this.handleUlcOnlyChange}
            onItemAdded={this.onItemAdded}
          />
        </div>
        <ProductTable
          products={this.props.products}
          filterText={this.state.filterText}
          ulcOnly={this.state.ulcOnly}
          onItemAdded={this.onItemAdded}
        />
      </div>
    );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    this.handleUlcOnlyChange = this.handleUlcOnlyChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleFilterTextChange(e) {
    this.props.onFilterTextChange(e.target.value);
  }

  handleUlcOnlyChange(e) {
    this.props.onUlcOnlyChange(e.target.checked);
  }

  handleKeyDown(e) {
    if (e.ctrlKey && e.key === "f") {
      e.preventDefault(); // prevent the default Ctrl+F behavior
      this.inputField.focus();
    } else if (e.key === "Enter") {
      const product = this.props.products.find((p) =>
        p.name.toLowerCase().startsWith(this.props.filterText.toLowerCase())
      );
      if (product) {
        this.props.onItemAdded(product);
      }
    }
  }

  render() {
    return (
      <form>
        <input
          type="text"
          className="InputElementStyle"
          placeholder="Search"
          value={this.props.filterText}
          onChange={this.handleFilterTextChange}
          ref={(input) => {
            this.inputField = input;
          }} // assign a ref to the input field
        />
        <input
          type="checkbox"
          className="InputElementStyle"
          checked={this.props.ulcOnly}
          onChange={this.handleUlcOnlyChange}
        />{" "}
        Only show ULC
      </form>
    );
  }
}

class ProductTable extends React.Component {
  render() {
    const filteredText = this.props.filterText;
    const isUlcOnly = this.props.ulcOnly;

    const rows = [];

    if (this.props.products) {
      this.props.products.forEach((product) => {
        if (
          product.name.toLowerCase().indexOf(filteredText.toLowerCase()) === -1
        ) {
          return;
        }
        if (isUlcOnly && !product.ulcOnly) {
          return;
        }
        rows.push(
          <ProductRow
            product={product}
            key={product.name}
            onItemAdded={this.props.onItemAdded}
          />
        );
      });
      return (
        <table className="table striped bordered hover">
          <tbody>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Protein</th>
              <th>Fat</th>
              <th>Carbs</th>
              <th></th>
            </tr>
            {rows}
          </tbody>
        </table>
      );
    } else return <h1>Loading products</h1>;
  }
}

class ProductRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onItemAdded(this.props.product);
  }

  render() {
    const product = this.props.product;
    const name = product.name;

    return (
      <tr>
        <td className="name-cell">{name}</td>
        <td>{product.category}</td>
        <td>{Math.ceil(product.macrosPrHundred.protein * 100)}</td>
        <td>{Math.ceil(product.macrosPrHundred.fat * 100)}</td>
        <td>{Math.ceil(product.macrosPrHundred.carbs * 100)}</td>
        <td>
          <button onClick={this.handleClick}>+</button>
        </td>
      </tr>
    );
  }
}

class ConsumedFoodRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grams: props.grams,
    };
    this.gramsChanged = this.handleGramsChanged.bind(this);
    this.onItemRemoved = this.onItemRemoved.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  onItemRemoved() {
    this.props.onItemRemoved(this.props.name);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(e) {
    if (
      this.inputRef === document.activeElement &&
      e.shiftKey &&
      e.key === "Delete"
    ) {
      this.onItemRemoved();
    }
  }

  handleGramsChanged(e) {
    let newGrams = Number(e.target.value);
    this.setState({
      grams: newGrams,
    });

    this.props.onGramsChanged(this.props.name, newGrams);
  }

  render() {
    let product;
    for (var i = 0; i < this.props.products.length; i++) {
      if (this.props.products[i].name === this.props.name) {
        product = this.props.products[i];
        break;
      }
    }

    let fat = Math.ceil(product.macrosPrHundred.fat * this.state.grams);
    let protein = Math.ceil(product.macrosPrHundred.protein * this.state.grams);
    let carbs = Math.ceil(product.macrosPrHundred.carbs * this.state.grams);

    return (
      <tr>
        <td className="name-cell">{this.props.name}</td>
        <td>
          <input
            type="text"
            value={this.state.grams}
            onChange={this.gramsChanged}
            autoFocus={this.props.autoFocus}
            ref={(ref) => (this.inputRef = ref)} // Add a ref to the input field
          ></input>
        </td>
        <td>{protein}</td>
        <td>{fat}</td>
        <td>{carbs}</td>
        <td>
          <button onClick={this.onItemRemoved}>X</button>
        </td>
      </tr>
    );
  }
}
