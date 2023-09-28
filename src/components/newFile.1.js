import { driver } from './RegisterForm.vue';

export default (await import('vue')).defineComponent({
data: () => {
return {
position: 0,
inputLabel: '',
inputType: 'text',
inputValue: '',
showContainer: false,
showFinal: false,
progress: '0%',
registerSteps: [
{
label: "What's your name?",
type: "text",
value: "",
pattern: /.+/
},
{
label: "How old are you?",
type: "integer",
value: "",
pattern: /^[0-9]+$/
},
{
label: "Which campus do you live in? (Zhongguancun or Liangxiang)",
type: "text",
value: "",
pattern: /.+/
},
{
label: "What's your favorite programming language?",
type: "text",
value: "",
pattern: /.+/ ///^[^\s@]+@[^\s@]+\.[^\s@]+$/
},
{
label: `What's your coding level?`,
type: "text",
value: "",
pattern: /.+/ ///^[^\s@]+@[^\s@]+\.[^\s@]+$/
},
{
label: "Where are you from?",
type: "text",
value: "",
pattern: /.+/
}
]
};
},
methods: {
setStep() {
this.inputLabel = this.registerSteps[this.position].label;
this.inputType = this.registerSteps[this.position].type;
this.inputValue = this.registerSteps[this.position].value;
this.$refs.registerinput.focus();
this.showStep();
},
showStep() {
setTimeout(() => {
this.showContainer = true;
}, 100);
},
hideStep(callback) {
this.showContainer = false;
setTimeout(callback, 100);
},
previousStep() {
this.position -= 1;
register.className = '';
this.hideStep(this.setStep);
this.setProgress();
},
checkStep() {
if (!this.registerSteps[this.position].pattern.test(this.inputValue)) {
register.classList.add('wrong');
register.classList.add('wronganimation');
setTimeout(() => {
register.classList.remove('wronganimation');
}, 500);
this.$refs.registerinput.focus();
}
else {
register.className = '';
register.classList.add('okanimation');
setTimeout(() => {
register.classList.remove('okanimation');
}, 200);

this.registerSteps[this.position].value = this.inputValue;
this.position += 1;
if (this.registerSteps[this.position]) {
this.hideStep(this.setStep);
}
else {
this.hideStep(() => {
register.className = 'close';
setTimeout(() => {
this.register_nodes();
this.showFinal = true;
}, 3000);
});
}
}

this.setProgress();
},
setProgress() {
this.progress = (this.position / this.registerSteps.length * 100) + '%';
},
async register_nodes() {
let session = driver.session({ database: 'neo4j' });
const { records, summary, keys } = await driver.executeQuery(
`
          MERGE (person:PERSON { name: apoc.text.capitalize(toLower(trim('${this.registerSteps[0].value}'))), country: apoc.text.capitalize(toLower(trim('${this.registerSteps[5].value}'))), age: toInteger(${this.registerSteps[1].value}) })
          ON CREATE SET person.created = timestamp()
          MERGE (campus:CAMPUS { name: apoc.text.capitalize(toLower(trim('${this.registerSteps[2].value}'))) })
          MERGE (pl:PROG_LANG { name: apoc.text.capitalize(toLower(trim('${this.registerSteps[3].value}'))) })
          WITH person, campus, pl
          MATCH (others:PERSON) WHERE others <> person
          MERGE (person) - [:CLASSMATES_WITH{common_class: "Big Data Analysis"}] -> (others)
          MERGE (person) - [:LIVES_IN] -> (campus)
          MERGE (person)-[:LIKES {coding_level: apoc.text.capitalize(toLower(trim('${this.registerSteps[4].value}')))}]->(pl)
          `
);

// Summary information
console.log(
`>> The query ${summary.query.text} ` +
`returned ${records.length} records ` +
`in ${summary.resultAvailableAfter} ms.`
);


// Close connections with the database
session.close();
driver.close();
}
},
mounted() {
let register = document.getElementById('register');
var neo4j = require('neo4j-driver');
(async () => {
// URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
const URI = process.env.VUE_APP_URI;
const USER = process.env.VUE_APP_USER;
const PASSWORD = process.env.VUE_APP_PASSWORD;


try {
driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
const serverInfo = await driver.getServerInfo();
console.log('Connection established');
console.log(serverInfo);
} catch (err) {
console.log(`Connection error\n${err}\nCause: ${err.cause}`);
}
})();

this.setStep();
}
});
