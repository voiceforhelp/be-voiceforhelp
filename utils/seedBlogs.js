const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Blog = require('../models/Blog');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const blogs = [
  {
    title: 'गौ सेवा — गाय की सेवा क्यों है भारत की सबसे बड़ी सेवा',
    shortDescription: 'जानिये कैसे Voice For Help Trust हर दिन सैकड़ों गायों को चारा, पानी और इलाज उपलब्ध करा रहा है। गौ सेवा सिर्फ धर्म नहीं, यह इंसानियत है।',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 245,
    content: `
<h2>गौ सेवा — भारत की सबसे पवित्र सेवा</h2>
<p>भारत में गाय को माता का दर्जा दिया गया है। लेकिन आज भी लाखों गायें सड़कों पर भूखी-प्यासी घूमती हैं, प्लास्टिक खाती हैं, और बीमारियों से तड़पती हैं। <strong>Voice For Help Trust</strong> ने इस दर्द को अपना दर्द माना और गौ सेवा को अपना मिशन बनाया।</p>

<h3>हम क्या करते हैं?</h3>
<ul>
<li><strong>रोज़ाना चारा वितरण</strong> — हर सुबह 200+ गायों को ताज़ा हरा चारा, गुड़ और पानी दिया जाता है</li>
<li><strong>बीमार गायों का इलाज</strong> — वेटरनरी डॉक्टर की टीम 24/7 उपलब्ध रहती है</li>
<li><strong>गौशाला संचालन</strong> — बेसहारा और घायल गायों को आश्रय दिया जाता है</li>
<li><strong>वीडियो प्रमाण</strong> — हर दिन की सेवा का वीडियो डोनर को भेजा जाता है</li>
</ul>

<h3>आपके ₹500 से क्या होता है?</h3>
<p>सिर्फ ₹500 में एक गाय को <strong>पूरे एक हफ्ते</strong> का चारा मिल जाता है। ₹2000 में एक बीमार गाय का पूरा इलाज हो जाता है। आपका हर रुपया सीधे गाय की सेवा में लगता है।</p>

<blockquote>
"जो गाय की सेवा करता है, वो पूरे संसार की सेवा करता है।" — यह सिर्फ कहावत नहीं, यह सच्चाई है।
</blockquote>

<h3>100% पारदर्शिता — हमारा वादा</h3>
<p>Voice For Help Trust में हर डोनेशन का हिसाब रखा जाता है। आपको <strong>डेली वीडियो प्रूफ</strong> मिलता है जिसमें आप देख सकते हैं कि आपका पैसा कहाँ और कैसे खर्च हुआ। कोई बहाना नहीं, कोई देरी नहीं — बस सच्ची सेवा।</p>

<h3>कैसे जुड़ें?</h3>
<p>आप <a href="/donate">यहाँ क्लिक करके</a> तुरंत डोनेट कर सकते हैं। UPI, कार्ड, नेट बैंकिंग — सब सपोर्टेड है। आपके डोनेशन की रसीद तुरंत मिलेगी।</p>

<p><strong>आज ही गौ सेवा में अपना योगदान दें। एक गाय की ज़िंदगी बदलें।</strong></p>
`,
    socialContent: {
      youtube: {
        title: 'गौ सेवा — 200+ गायों को रोज़ खिलाना | Voice For Help Trust',
        description: 'देखिये कैसे Voice For Help Trust हर दिन 200+ गायों को चारा, पानी और इलाज देता है। 100% पारदर्शी — वीडियो प्रूफ के साथ। अभी डोनेट करें: voiceforhelp.com/donate',
        tags: ['गौ सेवा', 'cow feeding', 'gaushala', 'gau seva', 'Voice For Help', 'NGO India', 'cow care India', 'donate for cows', 'animal welfare', 'Rajasthan NGO'],
      },
      instagram: {
        caption: '🐄 गौ माता की सेवा — हमारा फ़र्ज़\n\nहर सुबह 200+ गायों को ताज़ा चारा और पानी 🌾\nबीमार गायों का मुफ्त इलाज 💊\n\nआपके ₹500 = एक गाय का एक हफ्ते का खाना\n\n🙏 डोनेट करें: voiceforhelp.com/donate\n📹 हर दिन वीडियो प्रूफ मिलेगा',
        hashtags: ['#गौसेवा', '#GauSeva', '#CowFeeding', '#Gaushala', '#VoiceForHelp', '#DonateForCows', '#AnimalWelfare', '#NGOIndia', '#CowProtection', '#GoSeva', '#GauMata', '#Rajasthan', '#TransparentDonation', '#CharityIndia', '#BeTheVoice'],
      },
      facebook: '🐄 गौ सेवा — सबसे बड़ी सेवा\n\nVoice For Help Trust हर दिन 200+ बेसहारा गायों को चारा, पानी और इलाज दे रहा है।\n\nआपके ₹500 में एक गाय को पूरे हफ्ते का खाना मिलता है। और सबसे खास बात — हम हर दिन वीडियो भेजते हैं जिसमें आप देख सकते हैं कि आपका पैसा कहाँ गया।\n\n🙏 अभी डोनेट करें: voiceforhelp.com/donate\n\n#गौसेवा #VoiceForHelp #DonateForCows',
    },
  },
  {
    title: 'Street Dogs को बचाने की मुहिम — कैसे आपका डोनेशन एक कुत्ते की जान बचाता है',
    shortDescription: 'सड़क पर घायल, बीमार और भूखे कुत्तों का इलाज और देखभाल। जानिये कैसे Voice For Help Trust हर दिन दर्जनों street dogs की जान बचा रहा है।',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 189,
    content: `
<h2>Street Dogs — भारत की सड़कों पर खामोश चीखें</h2>
<p>भारत में करीब <strong>6 करोड़ आवारा कुत्ते</strong> हैं। इनमें से लाखों हर साल सड़क दुर्घटनाओं, बीमारियों और भुखमरी से मर जाते हैं। इनकी कोई आवाज़ नहीं, कोई सहारा नहीं — लेकिन <strong>Voice For Help Trust</strong> ने इन खामोश जानवरों की आवाज़ बनने का फैसला किया।</p>

<h3>हमारा Dog Care प्रोग्राम</h3>
<ul>
<li><strong>Emergency Rescue</strong> — दुर्घटना में घायल कुत्तों को तुरंत रेस्क्यू करना</li>
<li><strong>Medical Treatment</strong> — Mange, distemper, parvo जैसी बीमारियों का इलाज</li>
<li><strong>Daily Feeding</strong> — हर रोज़ 50+ street dogs को खाना खिलाना</li>
<li><strong>Vaccination</strong> — Anti-rabies और अन्य ज़रूरी टीके लगवाना</li>
<li><strong>Sterilization</strong> — ABC (Animal Birth Control) प्रोग्राम</li>
</ul>

<h3>एक Real Story — "भूरा" की कहानी</h3>
<p>भूरा एक 3 साल का कुत्ता था जो सड़क दुर्घटना में बुरी तरह घायल हो गया था। उसकी पिछली दोनों टांगें टूट गई थीं। किसी ने मदद नहीं की — लेकिन हमारी टीम ने उसे रेस्क्यू किया, सर्जरी करवाई, और आज <strong>भूरा खुशी से दौड़ता है</strong>। यह सब आपके डोनेशन से संभव हुआ।</p>

<blockquote>
"एक जानवर की जान बचाना — यही सबसे बड़ी इंसानियत है।"
</blockquote>

<h3>आपके ₹1000 से क्या होता है?</h3>
<p>₹1000 में एक घायल कुत्ते का <strong>पूरा बेसिक इलाज</strong> हो जाता है — दवाइयाँ, bandaging, और खाना। ₹5000 में एक बड़ी सर्जरी हो सकती है। आपका हर रुपया एक ज़िंदगी बचाता है।</p>

<h3>वीडियो प्रूफ — देखें अपना Impact</h3>
<p>हम हर rescue और feeding का <strong>वीडियो बनाते हैं</strong> और आपको भेजते हैं। आप अपनी आँखों से देख सकते हैं कि आपका डोनेशन कहाँ गया।</p>

<p><strong>एक street dog की जान बचाएं — <a href="/donate">अभी डोनेट करें</a></strong></p>
`,
    socialContent: {
      youtube: {
        title: 'Street Dog Rescue India — घायल कुत्ते को बचाया | Voice For Help',
        description: 'देखिये कैसे हमने एक बुरी तरह घायल street dog को बचाया और उसका इलाज किया। Voice For Help Trust हर दिन दर्जनों कुत्तों की मदद करता है। डोनेट करें: voiceforhelp.com/donate',
        tags: ['street dog rescue', 'dog rescue India', 'animal rescue', 'Voice For Help', 'stray dogs', 'dog feeding', 'animal welfare India', 'NGO for animals', 'dog treatment', 'save animals'],
      },
      instagram: {
        caption: '🐕 एक कुत्ते की जान बचाना = सबसे बड़ी इंसानियत\n\nहर दिन 50+ street dogs को खाना 🍖\nघायल कुत्तों का emergency rescue 🚑\nमुफ्त इलाज और vaccination 💉\n\nआपके ₹1000 = एक कुत्ते का पूरा इलाज\n\n🙏 डोनेट करें: voiceforhelp.com/donate',
        hashtags: ['#DogRescue', '#StrayDogs', '#AnimalRescue', '#VoiceForHelp', '#DogCare', '#StreetDogs', '#SaveAnimals', '#AnimalWelfare', '#DogFeeding', '#NGOIndia', '#Rajasthan', '#DonateForAnimals', '#BeKind', '#AdoptDontShop', '#AnimalLovers'],
      },
      facebook: '🐕 Street Dogs की मदद करें\n\nहर दिन हमारी टीम 50+ street dogs को खाना खिलाती है, घायल कुत्तों को rescue करती है, और बीमार कुत्तों का इलाज करती है।\n\nआपके ₹1000 में एक कुत्ते का पूरा इलाज हो जाता है। वीडियो प्रूफ के साथ 100% पारदर्शिता।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#DogRescue #VoiceForHelp #AnimalWelfare',
    },
  },
  {
    title: 'गरीब बच्चों को खाना खिलाना — भूख से लड़ाई में आपका साथ',
    shortDescription: 'भारत में हर 5वां बच्चा कुपोषित है। Voice For Help Trust गरीब बच्चों को पौष्टिक भोजन और शिक्षा दे रहा है। जानिये कैसे आपका ₹100 एक बच्चे का पेट भर सकता है।',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 312,
    content: `
<h2>भूख — भारत का सबसे बड़ा दुश्मन</h2>
<p>Global Hunger Index में भारत 125 देशों में <strong>111वें नंबर</strong> पर है। हर रात करोड़ों बच्चे भूखे पेट सोते हैं। कुपोषण की वजह से हर साल <strong>लाखों बच्चों की मौत</strong> होती है। यह सिर्फ आँकड़े नहीं हैं — यह किसी माँ का दर्द है जो अपने बच्चे को खाना नहीं दे पाती।</p>

<h3>Voice For Help का Food Distribution प्रोग्राम</h3>
<ul>
<li><strong>Daily Meals</strong> — हर दिन 100+ गरीब बच्चों और परिवारों को गर्म भोजन</li>
<li><strong>Sunday Special</strong> — हर रविवार को स्लम एरिया में special food distribution drive</li>
<li><strong>Festival Drives</strong> — दिवाली, होली, ईद पर बड़े food camps</li>
<li><strong>Nutrition Kits</strong> — कुपोषित बच्चों को protein-rich nutrition kits</li>
</ul>

<h3>₹100 = एक बच्चे का एक दिन का खाना</h3>
<p>हाँ, सिर्फ <strong>₹100</strong> में एक बच्चे को एक दिन का पूरा पौष्टिक भोजन मिल जाता है — दाल, चावल, सब्ज़ी, रोटी और मिठाई। ₹500 में 5 बच्चों का, और ₹2000 में 20 बच्चों को एक दिन का खाना मिलता है।</p>

<blockquote>
"कोई भी बच्चा भूखा न सोए — यह हमारा सपना है, और आपके साथ यह सच हो सकता है।"
</blockquote>

<h3>Real Impact — रामपुरा स्लम की कहानी</h3>
<p>जोधपुर के रामपुरा स्लम में 150 परिवार रहते हैं जहाँ ज़्यादातर बच्चे कुपोषित थे। Voice For Help ने वहाँ <strong>6 महीने तक daily meals</strong> दिए। आज वहाँ के बच्चों का वज़न बढ़ा है, वे स्कूल जा रहे हैं, और उनकी आँखों में उम्मीद दिखती है।</p>

<h3>पारदर्शिता — हमारी पहचान</h3>
<p>हर food distribution का <strong>वीडियो और फोटो</strong> डोनर को भेजा जाता है। आप देख सकते हैं कि आपका खाना किसके पेट में गया। कोई बीच का आदमी नहीं — सीधा आपसे ज़रूरतमंद तक।</p>

<p><strong>एक बच्चे की भूख मिटाएं — <a href="/donate">अभी ₹100 डोनेट करें</a></strong></p>
`,
    socialContent: {
      youtube: {
        title: 'गरीब बच्चों को खाना खिलाया 🙏 Food Distribution | Voice For Help',
        description: 'आज हमने 100+ गरीब बच्चों और परिवारों को गर्म भोजन दिया। देखिये उनकी खुशी। सिर्फ ₹100 में एक बच्चे को एक दिन का खाना दे सकते हैं। डोनेट करें: voiceforhelp.com/donate',
        tags: ['food distribution', 'feed the hungry', 'poor children India', 'food donation', 'Voice For Help', 'NGO India', 'charity India', 'help poor', 'bhojan daan', 'food for all'],
      },
      instagram: {
        caption: '🍚 एक बच्चे की भूख मिटाएं — सिर्फ ₹100 में\n\nहर दिन 100+ गरीब बच्चों को गर्म भोजन 🍛\nकुपोषित बच्चों को nutrition kits 📦\nहर donation का वीडियो प्रूफ 📹\n\n₹100 = 1 बच्चे का 1 दिन का खाना\n₹500 = 5 बच्चों का खाना\n\n🙏 डोनेट करें: voiceforhelp.com/donate',
        hashtags: ['#FeedTheHungry', '#FoodDonation', '#VoiceForHelp', '#ChildWelfare', '#FoodForAll', '#NGOIndia', '#GareebBachche', '#BhojanDaan', '#HelpThePoor', '#Rajasthan', '#Charity', '#NoChildHungry', '#TransparentDonation', '#FoodDistribution', '#DonateFood'],
      },
      facebook: '🍚 कोई बच्चा भूखा न सोए\n\nVoice For Help Trust हर दिन 100+ गरीब बच्चों और परिवारों को गर्म भोजन देता है।\n\nसिर्फ ₹100 में एक बच्चे को पूरे दिन का पौष्टिक खाना मिलता है। और हम हर बार वीडियो भेजते हैं ताकि आप देख सकें कि आपका पैसा कहाँ गया।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#FeedTheHungry #VoiceForHelp #FoodDonation',
    },
  },
  {
    title: 'Animal Welfare in India — Why Every Life Matters and How You Can Help',
    shortDescription: 'From injured cows to abandoned dogs, Voice For Help Trust rescues and cares for hundreds of animals every month. 100% transparent with daily video proof of every donation.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 167,
    content: `
<h2>Animal Welfare — The Silent Crisis in India</h2>
<p>India is home to <strong>millions of stray and abandoned animals</strong> — cows, dogs, cats, and birds — who suffer silently on our streets every day. They face accidents, diseases, starvation, and cruelty. Yet, most of us walk past them without a second glance.</p>

<p><strong>Voice For Help Trust</strong> was founded with a simple belief: every life matters. Whether it's a cow, a dog, or a bird — every creature deserves food, shelter, and medical care.</p>

<h3>What We Do Every Day</h3>
<ul>
<li><strong>200+ cows fed daily</strong> with fresh green fodder, jaggery, and clean water</li>
<li><strong>50+ street dogs fed daily</strong> with nutritious meals</li>
<li><strong>Emergency animal rescue</strong> — 24/7 helpline for injured animals</li>
<li><strong>Free veterinary treatment</strong> — surgeries, vaccinations, and medications</li>
<li><strong>Shelter for abandoned animals</strong> — gaushala and dog care center</li>
</ul>

<h3>The Voice For Help Difference — 100% Transparency</h3>
<p>What makes us different? <strong>Every single donation is documented with video proof.</strong> When you donate ₹500 for cow feeding, you receive a video the next day showing exactly how your money was used. No middlemen, no vague promises — just real, verifiable impact.</p>

<blockquote>
"Transparency isn't just our policy — it's our identity. We believe every donor deserves to see their impact with their own eyes."
</blockquote>

<h3>How Your Donation Helps</h3>
<p>₹500 feeds a cow for a week. ₹1,000 treats an injured dog. ₹2,000 provides a month of medication for a sick animal. ₹5,000 funds a life-saving surgery. Every rupee counts.</p>

<h3>Join the Movement</h3>
<p>You don't need to be rich to make a difference. Even ₹100 can provide a meal for a hungry animal. <a href="/donate">Donate now</a> and become part of India's most transparent donation platform.</p>

<p><strong>Be the voice for those who cannot speak. Be the change you want to see.</strong></p>
`,
    socialContent: {
      youtube: {
        title: 'Animal Welfare India — Rescuing & Feeding 200+ Animals Daily | Voice For Help',
        description: 'Watch how Voice For Help Trust rescues and feeds 200+ animals every day in Rajasthan, India. From cow feeding to dog rescue — 100% transparent with video proof. Donate: voiceforhelp.com/donate',
        tags: ['animal welfare India', 'animal rescue', 'cow feeding', 'dog rescue India', 'Voice For Help', 'NGO India', 'transparent donation', 'charity India', 'save animals', 'animal care'],
      },
      instagram: {
        caption: '🐾 Every Life Matters\n\n200+ cows fed daily 🐄\n50+ dogs rescued & fed 🐕\nFree veterinary treatment 💊\n24/7 animal rescue helpline 🚑\n\n100% transparent — video proof with every donation 📹\n\n₹500 = 1 cow fed for a week\n₹1000 = 1 dog treated\n\n🙏 Donate: voiceforhelp.com/donate',
        hashtags: ['#AnimalWelfare', '#VoiceForHelp', '#SaveAnimals', '#AnimalRescue', '#CowFeeding', '#DogRescue', '#NGOIndia', '#TransparentDonation', '#DonateForAnimals', '#BeTheVoice', '#AnimalLovers', '#Rajasthan', '#CharityIndia', '#Compassion', '#EveryLifeMatters'],
      },
      facebook: '🐾 Every Life Matters — Animal Welfare in India\n\nVoice For Help Trust rescues and cares for 200+ animals every single day. Cows, dogs, birds — every creature gets food, shelter, and medical care.\n\nWhat makes us different? 100% transparency. You get video proof of every donation.\n\n₹500 feeds a cow for a week. ₹1000 treats an injured dog.\n\nDonate: voiceforhelp.com/donate\n\n#AnimalWelfare #VoiceForHelp #TransparentDonation',
    },
  },
  {
    title: 'बुज़ुर्गों की सेवा — बेसहारा बुज़ुर्गों को खाना, दवाई और प्यार',
    shortDescription: 'बेसहारा बुज़ुर्ग जिन्हें अपनों ने छोड़ दिया — Voice For Help Trust उन्हें खाना, दवाई, कपड़े और सबसे ज़रूरी — प्यार और सम्मान दे रहा है।',
    image: 'https://images.unsplash.com/photo-1454418747937-bd95bb945625?w=1200&h=630&fit=crop&q=80',
    status: 'published',
    views: 198,
    content: `
<h2>बेसहारा बुज़ुर्ग — समाज की भूली हुई ज़िम्मेदारी</h2>
<p>भारत में <strong>लाखों बुज़ुर्ग</strong> बेसहारा हैं। अपने ही बच्चों ने उन्हें घर से निकाल दिया। कोई सड़क पर भीख माँगता है, कोई मंदिर की सीढ़ियों पर सोता है, कोई बीमारी से तड़पता है — लेकिन कोई पूछने वाला नहीं।</p>

<p><strong>Voice For Help Trust</strong> ने इन बुज़ुर्गों को अपना परिवार माना। हम उन्हें सिर्फ खाना नहीं देते — हम उन्हें <strong>इज़्ज़त, प्यार और उम्मीद</strong> देते हैं।</p>

<h3>हमारी सेवाएं</h3>
<ul>
<li><strong>गर्म भोजन</strong> — हर दिन बुज़ुर्गों को ताज़ा गर्म खाना</li>
<li><strong>Medical Help</strong> — दवाइयाँ, चेकअप, और hospital में भर्ती की व्यवस्था</li>
<li><strong>कपड़े और कम्बल</strong> — सर्दियों में गर्म कपड़े और कम्बल वितरण</li>
<li><strong>साथ और सम्मान</strong> — त्योहारों पर साथ मनाना, बातें करना, उनकी कहानियाँ सुनना</li>
</ul>

<h3>₹200 = एक बुज़ुर्ग को एक दिन का सहारा</h3>
<p>सिर्फ ₹200 में एक बेसहारा बुज़ुर्ग को <strong>खाना, चाय, और दवाई</strong> मिल जाती है। ₹1000 में एक हफ्ते का, और ₹5000 में पूरे महीने का सहारा मिलता है।</p>

<blockquote>
"जो समाज अपने बुज़ुर्गों का ख्याल नहीं रखता, वो किसी का ख्याल नहीं रख सकता।"
</blockquote>

<h3>पारदर्शिता — आपको दिखेगा आपका Impact</h3>
<p>हर सेवा का वीडियो और फोटो डोनर को भेजा जाता है। आप अपनी आँखों से देख सकते हैं कि आपके पैसे से किस बुज़ुर्ग की मदद हुई।</p>

<p><strong>एक बुज़ुर्ग को सहारा दें — <a href="/donate">अभी डोनेट करें</a></strong></p>
`,
    socialContent: {
      youtube: {
        title: 'बेसहारा बुज़ुर्गों को खाना और दवाई 🙏 | Voice For Help Trust',
        description: 'बेसहारा बुज़ुर्गों को गर्म खाना, दवाई और प्यार। Voice For Help Trust हर दिन दर्जनों बुज़ुर्गों की सेवा करता है। 100% पारदर्शी। डोनेट करें: voiceforhelp.com/donate',
        tags: ['बुज़ुर्ग सेवा', 'old age care', 'help elderly', 'Voice For Help', 'NGO India', 'elderly care India', 'feed the elderly', 'charity India', 'Rajasthan NGO', 'donate for elderly'],
      },
      instagram: {
        caption: '🧓 बुज़ुर्गों की सेवा — सबसे बड़ा पुण्य\n\nबेसहारा बुज़ुर्गों को गर्म खाना 🍛\nमुफ्त दवाइयाँ और चेकअप 💊\nसर्दियों में कम्बल वितरण 🧣\n\n₹200 = एक बुज़ुर्ग का एक दिन का सहारा\n\n🙏 डोनेट करें: voiceforhelp.com/donate',
        hashtags: ['#ElderCare', '#BuzurgSeva', '#VoiceForHelp', '#HelpTheElderly', '#NGOIndia', '#OldAgeCare', '#CharityIndia', '#Rajasthan', '#TransparentDonation', '#SeniorCitizens', '#Compassion', '#DonateNow', '#BeTheVoice', '#HelpOthers', '#Kindness'],
      },
      facebook: '🧓 बेसहारा बुज़ुर्गों को सहारा दें\n\nVoice For Help Trust हर दिन दर्जनों बेसहारा बुज़ुर्गों को गर्म खाना, दवाई और प्यार दे रहा है।\n\n₹200 में एक बुज़ुर्ग को एक दिन का खाना, चाय और दवाई मिलती है।\n\nहर सेवा का वीडियो प्रूफ मिलता है।\n\nडोनेट करें: voiceforhelp.com/donate\n\n#BuzurgSeva #VoiceForHelp #ElderCare',
    },
  },
];

async function seedBlogs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if blogs already seeded
    const existingCount = await Blog.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} blogs already exist. Skipping seed to avoid duplicates.`);
      console.log('   To re-seed, delete existing blogs first: db.blogs.deleteMany({})');
      process.exit(0);
    }

    // Find admin user to set as author
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Run seedAdmin.js first.');
      process.exit(1);
    }

    console.log(`Using admin: ${admin.name} (${admin.email})`);

    // Create blogs
    for (const blogData of blogs) {
      const blog = await Blog.create({
        ...blogData,
        author: admin._id,
      });
      console.log(`✅ Created: "${blog.title}" → /blogs/${blog.slug}`);
    }

    console.log(`\n🎉 Successfully seeded ${blogs.length} blogs!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedBlogs();
