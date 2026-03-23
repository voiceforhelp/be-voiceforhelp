const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');

// Seed tracker collection — tracks which seeds have already run
const seedTrackerSchema = new mongoose.Schema({
  seedName: { type: String, required: true, unique: true },
  ranAt: { type: Date, default: Date.now },
});
const SeedTracker = mongoose.models.SeedTracker || mongoose.model('SeedTracker', seedTrackerSchema);

// Check if a seed has already run
async function hasAlreadySeeded(seedName) {
  const record = await SeedTracker.findOne({ seedName });
  return !!record;
}

// Mark a seed as completed
async function markSeeded(seedName) {
  await SeedTracker.findOneAndUpdate(
    { seedName },
    { seedName, ranAt: new Date() },
    { upsert: true }
  );
}

// ────────────────────────────────────────
// BLOG SEED DATA
// ────────────────────────────────────────
const blogSeedData = [
  {
    title: 'गौ सेवा — गाय की सेवा क्यों है भारत की सबसे बड़ी सेवा',
    shortDescription: 'जानिये कैसे Voice For Help Trust हर दिन सैकड़ों गायों को चारा, पानी और इलाज उपलब्ध करा रहा है। गौ सेवा सिर्फ धर्म नहीं, यह इंसानियत है।',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 245,
    content: `<h2>गौ सेवा — भारत की सबसे पवित्र सेवा</h2><p>भारत में गाय को माता का दर्जा दिया गया है। लेकिन आज भी लाखों गायें सड़कों पर भूखी-प्यासी घूमती हैं, प्लास्टिक खाती हैं, और बीमारियों से तड़पती हैं। <strong>Voice For Help Trust</strong> ने इस दर्द को अपना दर्द माना और गौ सेवा को अपना मिशन बनाया।</p><h3>हम क्या करते हैं?</h3><ul><li><strong>रोज़ाना चारा वितरण</strong> — हर सुबह 200+ गायों को ताज़ा हरा चारा, गुड़ और पानी दिया जाता है</li><li><strong>बीमार गायों का इलाज</strong> — वेटरनरी डॉक्टर की टीम 24/7 उपलब्ध रहती है</li><li><strong>गौशाला संचालन</strong> — बेसहारा और घायल गायों को आश्रय दिया जाता है</li><li><strong>वीडियो प्रमाण</strong> — हर दिन की सेवा का वीडियो डोनर को भेजा जाता है</li></ul><h3>आपके ₹500 से क्या होता है?</h3><p>सिर्फ ₹500 में एक गाय को <strong>पूरे एक हफ्ते</strong> का चारा मिल जाता है। ₹2000 में एक बीमार गाय का पूरा इलाज हो जाता है। आपका हर रुपया सीधे गाय की सेवा में लगता है।</p><blockquote>"जो गाय की सेवा करता है, वो पूरे संसार की सेवा करता है।"</blockquote><h3>100% पारदर्शिता — हमारा वादा</h3><p>Voice For Help Trust में हर डोनेशन का हिसाब रखा जाता है। आपको <strong>डेली वीडियो प्रूफ</strong> मिलता है जिसमें आप देख सकते हैं कि आपका पैसा कहाँ और कैसे खर्च हुआ।</p><p><strong>आज ही गौ सेवा में अपना योगदान दें — <a href="/donate">अभी डोनेट करें</a></strong></p>`,
    socialContent: {
      youtube: { title: 'गौ सेवा — 200+ गायों को रोज़ खिलाना | Voice For Help Trust', description: 'देखिये कैसे Voice For Help Trust हर दिन 200+ गायों को चारा देता है। डोनेट करें: voiceforhelp.com/donate', tags: ['गौ सेवा', 'cow feeding', 'gaushala', 'gau seva', 'Voice For Help', 'NGO India', 'cow care India', 'donate for cows', 'animal welfare', 'Rajasthan NGO'] },
      instagram: { caption: '🐄 गौ माता की सेवा — हमारा फ़र्ज़\n\nहर सुबह 200+ गायों को ताज़ा चारा और पानी 🌾\nआपके ₹500 = एक गाय का एक हफ्ते का खाना\n\n🙏 डोनेट करें: voiceforhelp.com/donate', hashtags: ['#गौसेवा', '#GauSeva', '#CowFeeding', '#Gaushala', '#VoiceForHelp', '#DonateForCows', '#AnimalWelfare', '#NGOIndia', '#CowProtection', '#GoSeva', '#GauMata', '#Rajasthan', '#TransparentDonation', '#CharityIndia', '#BeTheVoice'] },
      facebook: '🐄 गौ सेवा — सबसे बड़ी सेवा\n\nVoice For Help Trust हर दिन 200+ बेसहारा गायों को चारा दे रहा है। आपके ₹500 में एक गाय को पूरे हफ्ते का खाना मिलता है।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#गौसेवा #VoiceForHelp #DonateForCows',
    },
  },
  {
    title: 'Street Dogs को बचाने की मुहिम — कैसे आपका डोनेशन एक कुत्ते की जान बचाता है',
    shortDescription: 'सड़क पर घायल, बीमार और भूखे कुत्तों का इलाज और देखभाल। जानिये कैसे Voice For Help Trust हर दिन दर्जनों street dogs की जान बचा रहा है।',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 189,
    content: `<h2>Street Dogs — भारत की सड़कों पर खामोश चीखें</h2><p>भारत में करीब <strong>6 करोड़ आवारा कुत्ते</strong> हैं। इनमें से लाखों हर साल सड़क दुर्घटनाओं और बीमारियों से मर जाते हैं। <strong>Voice For Help Trust</strong> ने इन खामोश जानवरों की आवाज़ बनने का फैसला किया।</p><h3>हमारा Dog Care प्रोग्राम</h3><ul><li><strong>Emergency Rescue</strong> — घायल कुत्तों को तुरंत रेस्क्यू</li><li><strong>Medical Treatment</strong> — Mange, distemper जैसी बीमारियों का इलाज</li><li><strong>Daily Feeding</strong> — हर रोज़ 50+ street dogs को खाना</li><li><strong>Vaccination</strong> — Anti-rabies और अन्य ज़रूरी टीके</li></ul><h3>आपके ₹1000 से क्या होता है?</h3><p>₹1000 में एक घायल कुत्ते का <strong>पूरा बेसिक इलाज</strong> हो जाता है। ₹5000 में एक बड़ी सर्जरी हो सकती है।</p><blockquote>"एक जानवर की जान बचाना — यही सबसे बड़ी इंसानियत है।"</blockquote><p><strong>एक street dog की जान बचाएं — <a href="/donate">अभी डोनेट करें</a></strong></p>`,
    socialContent: {
      youtube: { title: 'Street Dog Rescue India — घायल कुत्ते को बचाया | Voice For Help', description: 'देखिये कैसे हमने एक घायल street dog को बचाया। डोनेट करें: voiceforhelp.com/donate', tags: ['street dog rescue', 'dog rescue India', 'animal rescue', 'Voice For Help', 'stray dogs', 'dog feeding', 'animal welfare India', 'NGO for animals', 'dog treatment', 'save animals'] },
      instagram: { caption: '🐕 एक कुत्ते की जान बचाना = सबसे बड़ी इंसानियत\n\nहर दिन 50+ street dogs को खाना 🍖\nघायल कुत्तों का emergency rescue 🚑\n\nआपके ₹1000 = एक कुत्ते का पूरा इलाज\n\n🙏 डोनेट करें: voiceforhelp.com/donate', hashtags: ['#DogRescue', '#StrayDogs', '#AnimalRescue', '#VoiceForHelp', '#DogCare', '#StreetDogs', '#SaveAnimals', '#AnimalWelfare', '#DogFeeding', '#NGOIndia', '#Rajasthan', '#DonateForAnimals', '#BeKind', '#AdoptDontShop', '#AnimalLovers'] },
      facebook: '🐕 Street Dogs की मदद करें\n\nहर दिन 50+ street dogs को खाना, घायल कुत्तों को rescue, बीमार कुत्तों का इलाज।\n\nआपके ₹1000 में एक कुत्ते का पूरा इलाज।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#DogRescue #VoiceForHelp #AnimalWelfare',
    },
  },
  {
    title: 'गरीब बच्चों को खाना खिलाना — भूख से लड़ाई में आपका साथ',
    shortDescription: 'भारत में हर 5वां बच्चा कुपोषित है। Voice For Help Trust गरीब बच्चों को पौष्टिक भोजन दे रहा है। आपका ₹100 एक बच्चे का पेट भर सकता है।',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 312,
    content: `<h2>भूख — भारत का सबसे बड़ा दुश्मन</h2><p>Global Hunger Index में भारत <strong>111वें नंबर</strong> पर है। हर रात करोड़ों बच्चे भूखे पेट सोते हैं। कुपोषण की वजह से हर साल <strong>लाखों बच्चों की मौत</strong> होती है।</p><h3>Voice For Help का Food Distribution प्रोग्राम</h3><ul><li><strong>Daily Meals</strong> — हर दिन 100+ गरीब बच्चों को गर्म भोजन</li><li><strong>Sunday Special</strong> — हर रविवार को स्लम एरिया में food distribution drive</li><li><strong>Festival Drives</strong> — दिवाली, होली, ईद पर बड़े food camps</li><li><strong>Nutrition Kits</strong> — कुपोषित बच्चों को protein-rich nutrition kits</li></ul><h3>₹100 = एक बच्चे का एक दिन का खाना</h3><p>सिर्फ <strong>₹100</strong> में एक बच्चे को पूरा पौष्टिक भोजन — दाल, चावल, सब्ज़ी, रोटी। ₹500 में 5 बच्चों का खाना।</p><blockquote>"कोई भी बच्चा भूखा न सोए — यह हमारा सपना है।"</blockquote><p><strong>एक बच्चे की भूख मिटाएं — <a href="/donate">अभी ₹100 डोनेट करें</a></strong></p>`,
    socialContent: {
      youtube: { title: 'गरीब बच्चों को खाना खिलाया 🙏 Food Distribution | Voice For Help', description: '100+ गरीब बच्चों को गर्म भोजन। सिर्फ ₹100 में एक बच्चे को खाना। डोनेट करें: voiceforhelp.com/donate', tags: ['food distribution', 'feed the hungry', 'poor children India', 'food donation', 'Voice For Help', 'NGO India', 'charity India', 'help poor', 'bhojan daan', 'food for all'] },
      instagram: { caption: '🍚 एक बच्चे की भूख मिटाएं — सिर्फ ₹100 में\n\nहर दिन 100+ गरीब बच्चों को गर्म भोजन 🍛\n\n₹100 = 1 बच्चे का 1 दिन का खाना\n₹500 = 5 बच्चों का खाना\n\n🙏 डोनेट करें: voiceforhelp.com/donate', hashtags: ['#FeedTheHungry', '#FoodDonation', '#VoiceForHelp', '#ChildWelfare', '#FoodForAll', '#NGOIndia', '#GareebBachche', '#BhojanDaan', '#HelpThePoor', '#Rajasthan', '#Charity', '#NoChildHungry', '#TransparentDonation', '#FoodDistribution', '#DonateFood'] },
      facebook: '🍚 कोई बच्चा भूखा न सोए\n\nहर दिन 100+ गरीब बच्चों को गर्म भोजन। सिर्फ ₹100 में एक बच्चे को खाना। वीडियो प्रूफ के साथ।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#FeedTheHungry #VoiceForHelp #FoodDonation',
    },
  },
  {
    title: 'Animal Welfare in India — Why Every Life Matters and How You Can Help',
    shortDescription: 'From injured cows to abandoned dogs, Voice For Help Trust rescues and cares for hundreds of animals every month. 100% transparent with daily video proof.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 167,
    content: `<h2>Animal Welfare — The Silent Crisis in India</h2><p>India is home to <strong>millions of stray and abandoned animals</strong> who suffer silently on our streets. <strong>Voice For Help Trust</strong> was founded with a simple belief: every life matters.</p><h3>What We Do Every Day</h3><ul><li><strong>200+ cows fed daily</strong> with fresh green fodder and clean water</li><li><strong>50+ street dogs fed daily</strong> with nutritious meals</li><li><strong>Emergency animal rescue</strong> — 24/7 helpline</li><li><strong>Free veterinary treatment</strong> — surgeries, vaccinations, medications</li></ul><h3>The Voice For Help Difference — 100% Transparency</h3><p><strong>Every single donation is documented with video proof.</strong> When you donate ₹500, you receive a video showing exactly how your money was used.</p><blockquote>"Transparency isn't just our policy — it's our identity."</blockquote><h3>How Your Donation Helps</h3><p>₹500 feeds a cow for a week. ₹1,000 treats an injured dog. ₹5,000 funds a life-saving surgery.</p><p><strong>Be the voice for those who cannot speak — <a href="/donate">Donate now</a></strong></p>`,
    socialContent: {
      youtube: { title: 'Animal Welfare India — Feeding 200+ Animals Daily | Voice For Help', description: 'Watch how Voice For Help Trust rescues and feeds 200+ animals daily. 100% transparent. Donate: voiceforhelp.com/donate', tags: ['animal welfare India', 'animal rescue', 'cow feeding', 'dog rescue India', 'Voice For Help', 'NGO India', 'transparent donation', 'charity India', 'save animals', 'animal care'] },
      instagram: { caption: '🐾 Every Life Matters\n\n200+ cows fed daily 🐄\n50+ dogs rescued & fed 🐕\nFree veterinary treatment 💊\n\n₹500 = 1 cow fed for a week\n₹1000 = 1 dog treated\n\n🙏 Donate: voiceforhelp.com/donate', hashtags: ['#AnimalWelfare', '#VoiceForHelp', '#SaveAnimals', '#AnimalRescue', '#CowFeeding', '#DogRescue', '#NGOIndia', '#TransparentDonation', '#DonateForAnimals', '#BeTheVoice', '#AnimalLovers', '#Rajasthan', '#CharityIndia', '#Compassion', '#EveryLifeMatters'] },
      facebook: '🐾 Every Life Matters\n\nVoice For Help Trust rescues and cares for 200+ animals every day. 100% transparency with video proof.\n\n₹500 feeds a cow for a week. ₹1000 treats an injured dog.\n\nDonate: voiceforhelp.com/donate\n\n#AnimalWelfare #VoiceForHelp #TransparentDonation',
    },
  },
  {
    title: 'बुज़ुर्गों की सेवा — बेसहारा बुज़ुर्गों को खाना, दवाई और प्यार',
    shortDescription: 'बेसहारा बुज़ुर्ग जिन्हें अपनों ने छोड़ दिया — Voice For Help Trust उन्हें खाना, दवाई, कपड़े और प्यार दे रहा है।',
    image: 'https://images.unsplash.com/photo-1454418747937-bd95bb945625?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 198,
    content: `<h2>बेसहारा बुज़ुर्ग — समाज की भूली हुई ज़िम्मेदारी</h2><p>भारत में <strong>लाखों बुज़ुर्ग</strong> बेसहारा हैं। अपने ही बच्चों ने उन्हें घर से निकाल दिया। <strong>Voice For Help Trust</strong> ने इन बुज़ुर्गों को अपना परिवार माना।</p><h3>हमारी सेवाएं</h3><ul><li><strong>गर्म भोजन</strong> — हर दिन बुज़ुर्गों को ताज़ा गर्म खाना</li><li><strong>Medical Help</strong> — दवाइयाँ, चेकअप, hospital में भर्ती</li><li><strong>कपड़े और कम्बल</strong> — सर्दियों में गर्म कपड़े वितरण</li><li><strong>साथ और सम्मान</strong> — त्योहारों पर साथ, उनकी कहानियाँ सुनना</li></ul><h3>₹200 = एक बुज़ुर्ग को एक दिन का सहारा</h3><p>सिर्फ ₹200 में एक बेसहारा बुज़ुर्ग को <strong>खाना, चाय, और दवाई</strong> मिल जाती है।</p><blockquote>"जो समाज अपने बुज़ुर्गों का ख्याल नहीं रखता, वो किसी का ख्याल नहीं रख सकता।"</blockquote><p><strong>एक बुज़ुर्ग को सहारा दें — <a href="/donate">अभी डोनेट करें</a></strong></p>`,
    socialContent: {
      youtube: { title: 'बेसहारा बुज़ुर्गों को खाना और दवाई 🙏 | Voice For Help Trust', description: 'बेसहारा बुज़ुर्गों को गर्म खाना, दवाई और प्यार। 100% पारदर्शी। डोनेट करें: voiceforhelp.com/donate', tags: ['बुज़ुर्ग सेवा', 'old age care', 'help elderly', 'Voice For Help', 'NGO India', 'elderly care India', 'feed the elderly', 'charity India', 'Rajasthan NGO', 'donate for elderly'] },
      instagram: { caption: '🧓 बुज़ुर्गों की सेवा — सबसे बड़ा पुण्य\n\nबेसहारा बुज़ुर्गों को गर्म खाना 🍛\nमुफ्त दवाइयाँ 💊\n\n₹200 = एक बुज़ुर्ग का एक दिन का सहारा\n\n🙏 डोनेट करें: voiceforhelp.com/donate', hashtags: ['#ElderCare', '#BuzurgSeva', '#VoiceForHelp', '#HelpTheElderly', '#NGOIndia', '#OldAgeCare', '#CharityIndia', '#Rajasthan', '#TransparentDonation', '#SeniorCitizens', '#Compassion', '#DonateNow', '#BeTheVoice', '#HelpOthers', '#Kindness'] },
      facebook: '🧓 बेसहारा बुज़ुर्गों को सहारा दें\n\nVoice For Help Trust हर दिन बेसहारा बुज़ुर्गों को गर्म खाना और दवाई दे रहा है।\n\n₹200 में एक बुज़ुर्ग को खाना, चाय और दवाई।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#BuzurgSeva #VoiceForHelp #ElderCare',
    },
  },
];

// ────────────────────────────────────────
// AUTO SEED FUNCTION (called from server.js)
// ────────────────────────────────────────
async function runAutoSeed() {
  try {
    // Seed: Blogs
    const blogSeedName = 'initial-blogs-v1';
    if (await hasAlreadySeeded(blogSeedName)) {
      console.log('[SEED] Blogs already seeded — skipping');
    } else {
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        console.log('[SEED] No admin user found — skipping blog seed');
      } else {
        const existingBlogs = await Blog.countDocuments();
        if (existingBlogs > 0) {
          console.log(`[SEED] ${existingBlogs} blogs already exist — marking as seeded`);
        } else {
          for (const blogData of blogSeedData) {
            const blog = await Blog.create({ ...blogData, author: admin._id });
            console.log(`[SEED] ✅ Blog created: "${blog.title.substring(0, 50)}..."`);
          }
          console.log(`[SEED] 🎉 ${blogSeedData.length} blogs seeded successfully`);
        }
        await markSeeded(blogSeedName);
      }
    }

    // Add more seeds here in future:
    // const categorySeedName = 'initial-categories-v1';
    // if (!await hasAlreadySeeded(categorySeedName)) { ... }

  } catch (error) {
    // Never crash the server — just log the error
    console.error('[SEED] Auto-seed error (non-fatal):', error.message);
  }
}

module.exports = { runAutoSeed };
