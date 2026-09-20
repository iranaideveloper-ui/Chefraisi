import React, { useState } from 'react';

export default function Survey() {
  const [rate, setRate] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!rate) {
      setError('لطفاً یک امتیاز انتخاب کنید');
      return;
    }
    
    // اینجا می‌توانید نظرسنجی را به سرور ارسال کنید
    setSubmitted(true);
    setError('');
  };

  if (submitted) {
    return (
      <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4">
        <div className="text-center py-8">
          <div className="text-green-400 text-lg mb-2">🎉 با تشکر از شرکت شما در نظرسنجی</div>
          <div className="text-gray-400">نظر شما با موفقیت ثبت شد</div>
          <button 
            onClick={() => {
              setSubmitted(false);
              setRate(null);
              setFeedback('');
            }}
            className="mt-4 text-[#d4af37] hover:text-[#b8962e] transition-colors"
          >
            ثبت نظر جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/70 rounded-lg p-4 text-white shadow mb-4">
      <h2 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">نظر سنجی کیفیت غذا</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block mb-2">امتیاز شما:</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(num => (
              <button
                key={num}
                className={`w-12 h-12 rounded-lg text-lg font-bold transition-all transform hover:scale-110
                  ${rate === num 
                    ? 'bg-[#d4af37] text-white' 
                    : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                onClick={() => {
                  setRate(num);
                  setError('');
                }}
              >
                {num}
              </button>
            ))}
          </div>
          {rate && (
            <div className="mt-2 text-sm text-gray-400">
              {rate === 5 ? 'عالی' : 
               rate === 4 ? 'خیلی خوب' :
               rate === 3 ? 'متوسط' :
               rate === 2 ? 'ضعیف' : 'خیلی ضعیف'}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2">نظر شما (اختیاری):</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-gray-800 rounded-lg p-3 text-white resize-none"
            rows={4}
            placeholder="نظر خود را بنویسید..."
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-[#d4af37] hover:bg-[#b8962e] text-white py-3 rounded-lg font-bold transition-colors"
        >
          ثبت نظر
        </button>
      </div>
    </div>
  );
}
