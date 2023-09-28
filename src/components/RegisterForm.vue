<template>
  <div class="container">
    
    <img id="bit-logo" src="/favicon.png" alt="" srcset="">
    <div id="progress" :style="{width: progress}"></div>
    <h1 id="final-mess"  :class="{'show-final': showFinal}">Thank you for your registeration, {{ registerSteps[0].value }}</h1>
    <div id="register" v-if="!showFinal">
      <i v-if="position === 0" class="previousButton fas fa-user"></i>
      <i v-else class="previousButton fas fa-arrow-left" @click="previousStep"></i>
      <i class="forwardButton fas fa-arrow-right" @click="checkStep"></i>
      <div id="inputContainer" :class="{'showContainer': showContainer}">
        <form @submit.prevent="checkStep">
          <input id="inputField" :type="inputType" v-model="inputValue" ref="registerinput" required />
          <label id="inputLabel">{{ inputLabel }}</label>
        </form>
        <div id="inputProgress"></div>
      </div>
    </div>

      




  </div>
</template>

<script>
export var driver

  export default {
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
      }
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
        }, 100)
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
        if(!this.registerSteps[this.position].pattern.test(this.inputValue)) {
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
          if(this.registerSteps[this.position]) {
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
        const campus_value = this.registerSteps[2].value.trim().toLowerCase()
        if (campus_value === "中关村" || campus_value === "zhonguancun") {
          this.registerSteps[2].value = 'Zhongguancun'
        }
        else if (campus_value === "良乡" || campus_value === "lianxiang") {
          this.registerSteps[2].value = 'Liangxiang'
        }
        let session = driver.session({ database: 'neo4j' })
        const { records, summary, keys } = await driver.executeQuery(
          `
          MERGE (person:STUDENT { name: apoc.text.capitalize(toLower(trim('${this.registerSteps[0].value}'))), country: apoc.text.capitalize(toLower(trim('${this.registerSteps[5].value}'))), age: toInteger(${this.registerSteps[1].value}) })
          ON CREATE SET person.created = timestamp()
          MERGE (campus:CAMPUS { name: apoc.text.capitalize(toLower(trim('${this.registerSteps[2].value}'))) })
          MERGE (pl:PROG_LANG { name: apoc.text.capitalize(toLower(trim('${this.registerSteps[3].value}'))) })
          WITH person, campus, pl
          MATCH (others:STUDENT) WHERE others <> person
          MERGE (person) - [:CLASSMATES_WITH{common_class: "Big Data Analysis"}] -> (others)
          MERGE (others) - [:CLASSMATES_WITH{common_class: "Big Data Analysis"}] -> (person)
          MERGE (person) - [:LIVES_IN] -> (campus)
          MERGE (person)-[:LIKES {coding_level: apoc.text.capitalize(toLower(trim('${this.registerSteps[4].value}')))}]->(pl)
          `
        )

        // Summary information
        console.log(
          `>> The query ${summary.query.text} ` +
          `returned ${records.length} records ` +
          `in ${summary.resultAvailableAfter} ms.`
        )
        
        
        // Close connections with the database
        session.close()
        driver.close()
      }
    },
    mounted() {
      let register = document.getElementById('register');
      var neo4j = require('neo4j-driver');
        (async () => {
          // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
          const URI = process.env.VUE_APP_URI
          const USER = process.env.VUE_APP_USER
          const PASSWORD = process.env.VUE_APP_PASSWORD
          

          try {
            driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))
            const serverInfo = await driver.getServerInfo()
            console.log('Connection established')
            console.log(serverInfo)
          } catch(err) {
            console.log(`Connection error\n${err}\nCause: ${err.cause}`)
          }
        })();

      this.setStep();
    }
  }
</script>

<style lang="scss" scoped>
  #bit-logo {
    position: absolute;
    top: 8%;
    width: 300px;
    height: 300px;
    z-index: 100;
  }
  .container {
    position: relative;
    font-family: 'Noto Sans', sans-serif;
    font-size: 1rem;
    color: #333;
    min-width: 100vw;
    min-height: 100vh;
    max-width: max-content;
    max-height: max-content;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(#009345, #106B4E);

    #progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 0%;
      height: 100vh;
      background-color: #106B4E;
      transition: width .8s ease-in-out;
    }
  }
  @media (max-width: 768px) {
    .container {
      min-width: 100vw;
      min-height: 100vh;
      max-width: max-content;
      max-height: max-content;
      overflow: hidden;
      padding: 0;
      margin: 0;
      padding-top: 20px;
    }
    .showContainer {
      #bit-logo {
        width: 20px;
        height: 20px;
      }
    }
    #register {
      min-width: 100vw;
      margin: 10px;
      height: 100px !important;
      z-index: 1000;
    }
    h1 {
      font-size: 0.01rem;
    }
  }




  h1 {
    position: absolute;
    min-width: min-content;
    min-height:min-content;
    font-size: 2rem;
    color: #fff;
    opacity: 0;
    transition: .8s ease-in-out;

    &.show-final {
      opacity: 1;
    }
  }

  #register {
    position: relative;
    width: 580px;
    height: 80px;
    padding: 10px;
    margin-top: 80px;
    background-color: #fff;
    box-shadow: 0 15px 30px rgba(0,0,0,.2),
                0 10px 10px rgba(0,0,0,.2);

    &.close {
      width: 0;
      padding: 10px 0;
      overflow: hidden;
      transition: .8s ease-in-out;
      box-shadow: 0 16px 24px 2px rgba(0,0,0,.2);
    }
  }

  .previousButton {
    position: absolute;
    left: 30px;
    top: 12px;
    font-size: 1rem;
    color: #9e9e9e;
    cursor: pointer;
    z-index: 20;

    &:hover {
      color: #009345;
    }
  }

  .forwardButton {
    position: absolute;
    top: 30px;
    right: 20px;
    font-size: 3rem;
    color: #106B4E;
    cursor: pointer;
    z-index: 20;

    &:hover {
      color: #009345;
    }
  }

  .wrong .forwardButton { color: #D93F38; }
  .close .forwardButton, .close .previousButton {
    color: #fff;
  }

  #inputContainer {
    position: relative;
    padding: 30px 20px 20px 20px;
    margin-right: 60px;
    opacity: 0;
    transition: opacity .3s ease-in-out;

    input {
      position: relative;
      width: 100%;
      font-size: 1.35rem;
      font-weight: bold;
      outline: 0;
      background: transparent;
      box-shadow: none;
      border: none;

      &:valid + #inputLabel {
        top: 3px;
        left: 42px;
        font-size: .7rem;
        font-weight: normal;
        color: #999;
      }
    }
  }

  #inputLabel {
    position: absolute;
    top: 32px;
    left: 20px;
    font-size: 1.35rem;
    font-weight: bold;
    pointer-events: none;
    transition: .2s ease-in-out;
  }

  #inputProgress {
    width: 0%;
    border-bottom: 6px solid #106B4E;
    transition: width .6s ease-in-out;
  }

  .wrong #inputProgress {
    border-color: #D93F38;
  }

  .showContainer {
    opacity: 1 !important;

    #inputProgress {
      width: 100%;
    }
  }

  .wronganimation {
    animation: .5s linear 0s 1 wrong-animation;
  }

  .okanimation {
    animation: .2s linear 0s 1 ok-animation;
  }

  @keyframes wrong-animation {
    0% { transform: translateX(0); }
    20% { transform: translateX(-20px); }
    40% { transform: translateX(20px); }
    60% { transform: translateX(-20px); }
    80% { transform: translateX(20px); }
    100% { transform: translateX(0); }
  }

  @keyframes ok-animation {
    0% { transform: translateY(0); }
    50% { transform: translateY(10px); }
    100% { transform: translateY(0); }
  }

  #final-mess {
    text-align: center;
  }
</style>
