
import React, { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';
import QRCode from '../components/QRCode.svg';
import IntelliMechLogo from '../components/IntelliMechLogo';
import axios from 'axios';

const Index = () => {
  const [voucherCode, setVoucherCode] = useState("");
  const [validityHours, setValidityHours] = useState(0);
  const [networkName, setNetworkName] = useState("INTELLIMECH-GUEST");
  const [voucherRemaining, setVoucherRemaining] = useState(0); // New state for voucherRemaining
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/guest-vouchers');
        //pick the code and split like xxxxx-xxxxx
        setVoucherRemaining(response.data.length);
        const code = response.data[0].code;
        const parts = code.match(/.{1,5}/g);
        const formattedCode = parts ? parts.join('-') : code;
        setVoucherCode(formattedCode);
        setValidityHours(response.data[0].duration / 60);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-intellimech-red text-white py-4">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold">Rete Wi-Fi per Ospiti</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow bg-white mt-12">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6 p-4">
            {/* Left Panel */}
            <div className="flex flex-col items-center justify-center p-4">
              <Wifi className="w-48 h-48 text-intellimech-red" />
              
              <h2 className="text-2xl font-bold mt-6 mb-8 text-center">
                {networkName}
              </h2>
              
              <div className="w-full max-w-md border-2 border-gray-200 rounded-lg p-4">
                <h3 className="text-xl text-center font-bold mb-2">
                  CODICE VOUCHER
                </h3>
                <div className="border-2 border-intellimech-red rounded-lg p-3 mb-2">
                  <p className="text-3xl font-mono text-center font-bold">
                    {voucherCode || "Loading..."}
                  </p>
                </div>
                <p className="text-center text-gray-600">
                  Validità: {validityHours} ore | Voucher rimanenti: {voucherRemaining}
                </p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col justify-center p-4">
              <h2 className="text-3xl font-bold text-intellimech-red mb-8">
                Come connettersi
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-black rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-4">
                    1
                  </div>
                  <div>
                    <p className="text-lg">
                      Cerca la rete Wi-Fi con nome<br />
                      <span className="text-intellimech-red font-bold">{networkName}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-black rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-4">
                    2
                  </div>
                  <div>
                    <p className="text-lg">
                      Inserisci il codice voucher<br />
                      quando richiesto
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-black rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-4">
                    3
                  </div>
                  <div>
                    <p className="text-lg">
                      Clicca su "Connetti"
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-left mt-4">
                  <img src="/qrcode.svg" alt="QR Code" className="w-64 h-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white p-4 border-t">
        <div className="flex justify-center">
          <IntelliMechLogo />
        </div>
      </footer>
    </div>
  );
};

export default Index;
