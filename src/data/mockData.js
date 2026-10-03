export const recipientOptions = ['Manager / Boss', 'Senior / Colleague', 'Client / Customer', 'Teacher / Professor', 'Friend', 'Parent / Elder', 'Relative', 'Partner', 'Stranger', 'Other'];

export const toneOptions = ['Polite', 'Professional', 'Warm', 'Friendly', 'Firm', 'Very Direct', 'Apologetic', 'Confident', 'Short & Simple'];

export const mockResponse = "I really appreciate you inviting me. I'd love to spend time together, but I already have a family commitment this weekend, so I won't be able to join this time. I hope you understand, and I'd definitely love to catch up another time.";

export const responseVariants = {
  softer: "Thank you so much for thinking of me. I really wish I could join, but I already have a family commitment this weekend. I hope you have a wonderful time, and I'd love to catch up soon.",
  direct: "Thanks for the invitation, but I already have family plans this weekend and won't be able to make it. Let's find another time to catch up.",
  shorter: "Thanks for inviting me. I already have family plans this weekend, so I can't make it, but I'd love to catch up another time.",
  again: "I appreciate the invitation, but I have a family commitment this weekend and need to keep that time. I hope you understand. Let's plan something soon."
};

export const mockHistory = [
  { id: 1, recipient: 'Manager', tone: 'Professional', situation: "Can't work on Sunday", date: 'Today', response: "Thank you for checking with me. I won't be available to work this Sunday, but I'm happy to help plan around it ahead of time." },
  { id: 2, recipient: 'Friend', tone: 'Friendly', situation: 'Declining weekend trip', date: 'Yesterday', response: mockResponse },
  { id: 3, recipient: 'Client', tone: 'Professional', situation: "Can't accept requested deadline", date: '3 days ago', response: "I want to make sure we deliver thoughtful work, and that timeline won't give us enough room to do that well. Could we discuss a more realistic date?" }
];

export const testimonials = [
  { quote: 'It helped me say no without writing a whole paragraph of apologies.', name: 'Maya R.', role: 'Product designer' },
  { quote: 'The tone options make a surprisingly big difference. I sounded like myself, just clearer.', name: 'Jordan L.', role: 'Small business owner' },
  { quote: 'A calm little reset when I am overthinking a difficult message.', name: 'Avery K.', role: 'Graduate student' }
];

export const faqs = [
  { question: 'What can I use HowToSayNo for?', answer: 'Use it for thoughtful refusals, boundary-setting, rescheduling, and any message where you want to be clear without sounding harsh.' },
  { question: 'Will the response sound like me?', answer: 'You choose the relationship and tone, then you can adjust the draft until it feels natural to send.' },
  { question: 'Can I use it for work and personal conversations?', answer: 'Yes. Choose the relationship that fits your situation and the draft will keep the tone appropriate for that person.' },
  { question: 'Is this a real AI service yet?', answer: 'This prototype uses example responses only. The full writing assistant will be connected in a future version.' },
  { question: 'Do I have to send the response exactly as written?', answer: 'No. Every draft is a starting point. Edit it until the words feel honest and comfortable for you.' }
];

export const pricingPlans = [
  { name: 'Free', price: '$0', description: 'A gentle start for everyday boundaries.', features: ['3 free generations', 'Basic responses', 'Polite and friendly tones'], action: 'Start for free' },
  { name: 'Pro', price: '$9', description: 'More room for all the things you need to say.', features: ['Extended usage', 'Response history', 'Advanced tone controls', 'Additional assistance'], action: 'Try Pro' }
];
