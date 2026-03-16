'use client';

import { formatWhatsAppLink } from '@/lib/utils';
import { useState } from 'react';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Olá! Meu nome é ${formData.name}.\n\nContato: ${formData.phone}\nEmail: ${formData.email}\n\nMensagem: ${formData.message}`;
    window.open(formatWhatsAppLink(whatsappMessage), '_blank');
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para atendê-lo. Entre em contato conosco através de qualquer um dos canais abaixo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            {/* Map */}
            <div className="bg-gray-200 rounded-xl overflow-hidden mb-8 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.3547!2d-38.5267!3d-3.8123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwNDgnNDQuMyJTIDM4wrAzMSczNi4xIlc!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Farmácia Medk"
              ></iframe>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📍</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-900">Endereço</h3>
                    <p className="text-gray-600">R. N, 4081B</p>
                    <p className="text-gray-600">Passaré, Fortaleza - CE</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=R.+N,+4081B+Passare+Fortaleza+CE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
                    >
                      Ver no mapa →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📞</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-900">Telefone</h3>
                    <a
                      href="tel:+5585213967 83"
                      className="text-gray-600 hover:text-green-600 transition-colors"
                    >
                      (85) 2139-6783
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💬</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-900">WhatsApp</h3>
                    <a
                      href={formatWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-600 transition-colors"
                    >
                      (85) 2139-6783
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🕒</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-900">Horário de Funcionamento</h3>
                    <p className="text-gray-600">Segunda a Sexta: 8h - 18h</p>
                    <p className="text-gray-600">Sábado: 8h - 14h</p>
                    <p className="text-gray-600">Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Envie uma Mensagem</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  data-testid="contact-name-input"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  data-testid="contact-email-input"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  data-testid="contact-phone-input"
                  placeholder="(85) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  data-testid="contact-message-input"
                  placeholder="Como podemos ajudar?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                data-testid="contact-submit-button"
              >
                💬 Enviar via WhatsApp
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              * Ao clicar em enviar, você será redirecionado para o WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}