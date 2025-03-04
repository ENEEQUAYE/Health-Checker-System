require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Condition = require("./models/Condition");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define models
// const UserSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   isAdmin: Boolean,
// });

// const ConditionSchema = new mongoose.Schema({
//   name: String,
//   symptoms: String,
//   advice: String,
// });

// const User = mongoose.model("User", UserSchema);
// const Condition = mongoose.model("Condition", ConditionSchema);

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Check if admin exists
    const adminExists = await User.findOne({ username: "Genius" });
    if (!adminExists) {
      const emailExists = await User.findOne({ email: "emmnauelneequaye294@outlook.com" });
      if (!emailExists) {
        const hashedPassword = await bcrypt.hash("Hsc@eneequaye!#", 10);
        await User.create({
          username: "Genius",
          email: "emmnauelneequaye294@outlook.com",
          password: hashedPassword,
          isAdmin: true,
          phone: "0508565631",
        });
        console.log("Admin user created.");
      } else {
        console.log("Email already exists.");
      }
    } else {
      console.log("Admin user already exists.");
    }


    // Define conditions
    const conditions = [
      { name: "COVID-19", symptoms: ["fever", "cough", "difficulty breathing", "fatigue", "body aches", "loss of taste or smell"], advice: "Isolate yourself, get tested, stay hydrated, and seek medical attention if symptoms worsen." },
      { name: "Common Cold", symptoms: ["cough", "sore throat", "runny nose", "sneezing", "mild fever"], advice: "Drink warm fluids, get rest, and take decongestants if needed." },
      { name: "Flu", symptoms: ["fever", "sore throat", "runny nose", "cough", "body aches", "fatigue"], advice: "Rest, stay hydrated, take over-the-counter flu medication, and consult a doctor if symptoms persist." },
      { name: "Measles", symptoms: ["fever", "rash", "runny nose", "cough", "red eyes"], advice: "Isolate yourself, take fever reducers, stay hydrated, and consult a doctor if symptoms worsen." },
      { name: "Tuberculosis", symptoms: ["fever", "night sweats", "chronic cough", "weight loss", "fatigue", "chest pain"], advice: "Get a TB test, avoid close contact with others, and seek medical treatment immediately." },
      { name: "Typhoid", symptoms: ["fever", "vomiting", "diarrhea", "abdominal pain", "weakness", "loss of appetite"], advice: "Drink plenty of fluids, avoid contaminated food and water, and take antibiotics as prescribed." },
      { name: "Pneumonia", symptoms: ["cough", "fever", "chest pain", "difficulty breathing", "chills"], advice: "Seek medical attention, take antibiotics if prescribed, and use a humidifier to ease breathing." },
      { name: "Heart Attack", symptoms: ["chest pain", "shortness of breath", "dizziness", "nausea", "cold sweat"], advice: "Seek emergency medical attention immediately." },
      { name: "Diabetes", symptoms: ["frequent urination", "excessive thirst", "unexplained weight loss", "fatigue"], advice: "Monitor blood sugar levels, follow a healthy diet, exercise regularly, and consult a doctor for medication." },
      { name: "Hypertension", symptoms: ["high blood pressure", "headaches", "dizziness", "nosebleeds"], advice: "Monitor blood pressure, reduce salt intake, exercise regularly, and consult a doctor." },
      { name: "Asthma", symptoms: ["wheezing", "shortness of breath", "coughing", "chest tightness"], advice: "Use prescribed inhalers, avoid triggers, and seek emergency care if breathing worsens." },
      { name: "Depression", symptoms: ["persistent sadness", "loss of interest", "fatigue", "sleep disturbances"], advice: "Seek counseling, engage in activities you enjoy, and consult a mental health professional if needed." },
      { name: "Anxiety Disorder", symptoms: ["excessive worry", "restlessness", "difficulty concentrating", "irritability"], advice: "Practice relaxation techniques, seek therapy, and consider medication if prescribed." },
      { name: "Migraine", symptoms: ["headache", "sensitivity to light", "nausea", "visual disturbances"], advice: "Rest in a dark, quiet room and take prescribed pain relievers." },
      { name: "Arthritis", symptoms: ["joint pain", "stiffness", "swelling", "limited movement"], advice: "Exercise regularly, use pain relievers, and seek medical consultation." },
      { name: "Gout", symptoms: ["severe joint pain", "swelling", "redness", "limited movement"], advice: "Avoid purine-rich foods, stay hydrated, and take prescribed medication." },
      { name: "Osteoporosis", symptoms: ["bone pain", "fractures", "loss of height", "stooped posture"], advice: "Increase calcium intake, exercise regularly, and consult a doctor for treatment." },
      { name: "Food Poisoning", symptoms: ["nausea", "vomiting", "diarrhea", "stomach cramps", "fever"], advice: "Drink plenty of fluids, rest, and avoid solid food until symptoms subside." },
      { name: "Acid Reflux", symptoms: ["stomach pain (upper)", "heartburn", "bloating", "nausea"], advice: "Avoid spicy and fatty foods, eat smaller meals, and take antacids if needed." },
      { name: "Gastroesophageal Reflux Disease (GERD)", symptoms: ["heartburn", "regurgitation", "chest pain", "difficulty swallowing"], advice: "Avoid trigger foods, eat smaller meals, and take prescribed medication." },
      { name: "Peptic Ulcer Disease", symptoms: ["stomach pain", "bloating", "nausea", "vomiting", "weight loss"], advice: "Avoid NSAIDs, spicy foods, and alcohol, and take prescribed medication." },
      { name: "Appendicitis", symptoms: ["stomach pain (lower right)", "fever", "nausea", "vomiting", "loss of appetite"], advice: "Seek emergency medical attention immediately as surgery may be required." },
      { name: "Irritable Bowel Syndrome (IBS)", symptoms: ["constipation", "abdominal bloating", "diarrhea", "stomach cramps"], advice: "Increase fiber intake, stay hydrated, and manage stress." },
      { name: "Crohn's Disease", symptoms: ["abdominal pain", "diarrhea", "fatigue", "weight loss", "blood in stool"], advice: "Follow a special diet, take prescribed medication, and consult a gastroenterologist." },
      { name: "Ulcerative Colitis", symptoms: ["abdominal pain", "diarrhea", "rectal bleeding", "fatigue", "weight loss"], advice: "Follow a special diet, take prescribed medication, and consult a gastroenterologist." },
      { name: "Hemorrhoids", symptoms: ["rectal pain", "itching", "bleeding", "swelling", "discomfort"], advice: "Use topical creams, sitz baths, and increase fiber intake to prevent constipation." },
      { name: "Diverticulitis", symptoms: ["abdominal pain (left side)", "fever", "nausea", "constipation", "diarrhea"], advice: "Follow a clear liquid diet, take antibiotics, and avoid high-fiber foods." },
      { name: "Gallstones", symptoms: ["sharp upper abdominal pain", "nausea", "vomiting", "indigestion"], advice: "Follow a low-fat diet, stay hydrated, and seek medical advice for potential surgery." },
      { name: "Stroke", symptoms: ["numbness", "weakness on one side", "difficulty speaking", "vision loss", "dizziness"], advice: "Seek emergency medical care immediately." },
      { name: "Meningitis", symptoms: ["severe headache", "stiff neck", "fever", "nausea", "confusion"], advice: "Seek emergency medical care immediately as it can be life-threatening." },
      { name: "Hepatitis", symptoms: ["jaundice", "fatigue", "nausea", "abdominal pain", "dark urine"], advice: "Consult a doctor for liver function tests and avoid alcohol and fatty foods." },
      { name: "Kidney Stones", symptoms: ["severe pain in the side or back", "blood in urine", "nausea", "vomiting"], advice: "Stay hydrated, take pain relievers, and consult a doctor for treatment." },
      { name: "Shingles", symptoms: ["blisters", "painful rash", "tingling sensation", "fever"], advice: "Take antiviral medication, apply cool compresses, and avoid contact with others to prevent spreading." },
      { name: "Chickenpox", symptoms: ["itchy rash", "fever", "headache", "fatigue", "loss of appetite"], advice: "Stay home, rest, and avoid scratching the blisters to prevent scarring." },
      { name: "Eczema", symptoms: ["itching", "red patches", "dry skin", "inflammation"], advice: "Moisturize regularly, avoid triggers, and use prescribed ointments." },
      { name: "Urinary Tract Infection (UTI)", symptoms: ["painful urination", "frequent urination", "lower abdominal pain"], advice: "Drink plenty of water, take prescribed antibiotics, and practice good hygiene." },
      { name: "Panic Attack", symptoms: ["heart palpitations", "anxiety", "shortness of breath", "dizziness", "sweating"], advice: "Practice deep breathing techniques, stay calm, and seek medical evaluation if frequent." },
      { name: "Sleep Apnea", symptoms: ["loud snoring", "daytime fatigue", "difficulty concentrating", "headaches"], advice: "Maintain a healthy weight, avoid alcohol before bedtime, and consult a doctor for sleep studies." },
      //conditons that include stomach ache
    ];

    // Insert conditions if they don't exist
    for (const condition of conditions) {
      const existingCondition = await Condition.findOne({ name: condition.name });
      if (!existingCondition) {
        await Condition.create(condition);
      }
    }

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
