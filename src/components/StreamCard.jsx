const StreamCard = ({ stream }) => {
  if (!stream) return null;
  
  const { snippet } = stream;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4 p-4 text-white">
      <h2 className="text-xl font-bold mb-2 line-clamp-2">{snippet.title}</h2>
      <p className="text-gray-300 mb-2">{snippet.channelTitle}</p>
      <p className="text-gray-400 text-sm line-clamp-3">{snippet.description}</p>
    </div>
  );
};

export default StreamCard; 