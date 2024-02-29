const mongoose = require('mongoose');

main().catch(err => console.log(err));
let State, City, Ruler, Reign, War, Battle, HistoricalEvent, HistoricalFigure;

async function main() {
    await connectToDB();
    await generateSchemes();
    const states = await State.find();
    if (states.length === 0) {
        console.log('No data found, creating example data...');
        await createExampleData();
    }
    await perfomBasic();
    await disconnectFromDB();
}

async function connectToDB() {
    try{
        await mongoose.connect('mongodb://localhost:27017/refbook');
        console.log('Connected to DB');
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
}
async function disconnectFromDB() {
    console.log('Disconnecting from DB');
    try {
        await mongoose.disconnect();
        console.log('Disconnected from DB successfully');
    } catch (err) {
        console.error('Error disconnecting from DB:', err);
    }
}

async function generateSchemes() {
    const stateSchema = new mongoose.Schema({
        name: String,
        established_date: Date,
        current_existence: Boolean,
        capital_city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }
      });
      
    // Schema for City
    const citySchema = new mongoose.Schema({
        name: String,
        country: { type: mongoose.Schema.Types.ObjectId, ref: 'State' }
      });
      
    // Schema for Ruler
    const rulerSchema = new mongoose.Schema({
        name: String,
        birth_date: Date,
        death_date: Date
      });
      
    // Schema for Reign
    const reignSchema = new mongoose.Schema({
        ruler: { type: mongoose.Schema.Types.ObjectId, ref: 'Ruler' },
        state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
        start_date: Date,
        end_date: Date
      });
      
    // Schema for War
    const warSchema = new mongoose.Schema({
        name: String,
        start_date: Date,
        end_date: Date,
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'State' }]
      });
      
    // Schema for Battle
    const battleSchema = new mongoose.Schema({
        name: String,
        war: { type: mongoose.Schema.Types.ObjectId, ref: 'War' },
        date: Date,
        location: String
      });
      
    // Schema for HistoricalEvent
    const historicalEventSchema = new mongoose.Schema({
        name: String,
        date: Date,
        state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
        description: String,
        involved_figures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HistoricalFigure' }]
      });
      
    // Schema for HistoricalFigure
    const historicalFigureSchema = new mongoose.Schema({
        name: String,
        birth_date: Date,
        death_date: Date,
        occupation: String,
        state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
        biography: String,
        events_participated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HistoricalEvent' }]
      });
      
    // Exporting schemas
    State = mongoose.model('State', stateSchema);
    City = mongoose.model('City', citySchema);
    Ruler = mongoose.model('Ruler', rulerSchema);
    Reign = mongoose.model('Reign', reignSchema);
    War = mongoose.model('War', warSchema);
    Battle = mongoose.model('Battle', battleSchema);
    HistoricalEvent = mongoose.model('HistoricalEvent', historicalEventSchema);
    HistoricalFigure = mongoose.model('HistoricalFigure', historicalFigureSchema);
      
    module.exports = {
        State,
        City,
        Ruler,
        Reign,
        War,
        Battle,
        HistoricalEvent,
        HistoricalFigure
    };
    console.log('Schemas generated');
}
async function createExampleData() {
    try {
      // Create states
      const california = await State.create({ name: 'California', established_date: new Date('1850-09-09'), current_existence: true });
      const texas = await State.create({ name: 'Texas', established_date: new Date('1845-12-29'), current_existence: true });
  
      // Create cities
      const losAngeles = await City.create({ name: 'Los Angeles', country: california._id });
      const austin = await City.create({ name: 'Austin', country: texas._id });
  
      // Create rulers
      const queenVictoria = await Ruler.create({ name: 'Queen Victoria', birth_date: new Date('1819-05-24'), death_date: new Date('1901-01-22') });
      const napoleonBonaparte = await Ruler.create({ name: 'Napoleon Bonaparte', birth_date: new Date('1769-08-15'), death_date: new Date('1821-05-05') });
  
      // Create reigns
      const reign1 = await Reign.create({ ruler: queenVictoria._id, state: california._id, start_date: new Date('1837-06-20'), end_date: new Date('1901-01-22') });
      const reign2 = await Reign.create({ ruler: napoleonBonaparte._id, state: texas._id, start_date: new Date('1804-05-18'), end_date: new Date('1814-04-06') });
  
      // Create wars
      const worldWar1 = await War.create({ name: 'World War I', start_date: new Date('1914-07-28'), end_date: new Date('1918-11-11'), participants: [california._id, texas._id] });
      const americanCivilWar = await War.create({ name: 'American Civil War', start_date: new Date('1861-04-12'), end_date: new Date('1865-05-09'), participants: [california._id] });
  
      // Create battles
      const battle1 = await Battle.create({ name: 'Battle of Gettysburg', war: americanCivilWar._id, date: new Date('1863-07-01'), location: 'Gettysburg, Pennsylvania' });
      const battle2 = await Battle.create({ name: 'Battle of the Somme', war: worldWar1._id, date: new Date('1916-07-01'), location: 'Somme, France' });
  
      // Create historical events
      const goldRush = await HistoricalEvent.create({ name: 'California Gold Rush', date: new Date('1848-01-24'), state: california._id, description: 'Mass migration to California following the discovery of gold.' });
      const frenchRevolution = await HistoricalEvent.create({ name: 'French Revolution', date: new Date('1789-07-14'), description: 'Revolution that led to the overthrow of the French monarchy.' });
  
      // Create historical figures
      const abrahamLincoln = await HistoricalFigure.create({ name: 'Abraham Lincoln', birth_date: new Date('1809-02-12'), death_date: new Date('1865-04-15'), occupation: 'President', biography: '16th President of the United States.' });
      const juliusCaesar = await HistoricalFigure.create({ name: 'Julius Caesar', birth_date: new Date('100-07-12'), death_date: new Date('44-03-15'), occupation: 'Emperor', biography: 'Roman general and statesman.' });
  
      // Update many-to-many relationships
      await HistoricalEvent.updateOne({ _id: goldRush._id }, { $push: { involved_figures: abrahamLincoln._id } });
      await HistoricalFigure.updateOne({ _id: abrahamLincoln._id }, { $push: { events_participated: goldRush._id } });
  
      console.log('Example data created successfully.');
    } catch (error) {
      console.error('Error creating example data:', error);
    }
}
  
async function perfomBasic() {
    console.log('---------Performing basic operations---------');
    await readState();
    await createCity();
    await updateCity();
    await deleteCity();
    console.log('---------Basic operations performed---------');
}
async function readState() {
    const states = await State.find().populate('capital_city');
    console.log('States:', states);
}
async function createCity() {
    const newYork = await City.create({ name: 'New York', established_date: new Date('1788-07-26'), current_existence: true });
    console.log('New city:', newYork);
}
async function updateCity() {
    const result = await City.updateOne({ name: 'New York' }, { current_existence: false });
    console.log('Updated city:', result);
}
async function deleteCity() {
    const result = await City.deleteOne({ name: 'New York' });
    console.log('Deleted city:', result);
}
