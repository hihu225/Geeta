import { FaBookOpen } from "react-icons/fa";
import jsPDF from "jspdf";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import Swal from "sweetalert2";
import "../hihu.css"
const exportChats = ({ chats, visibleChats,fontSize }) => {
  const handleExportAllChats = async () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(24);
      doc.setFont("times", "bold");
      doc.setTextColor(139, 0, 0);
      doc.text("Divine Wisdom: Bhagavad Gita", 105, 20, { align: "center" });

      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(139, 69, 19);
      doc.text("Collection of Wisdom", 105, 30, { align: "center" });

      // Decorative Line
      doc.setLineWidth(0.8);
      doc.setDrawColor(184, 134, 11);
      doc.line(20, 35, 190, 35);

      let currentY = 45;
      let pageNumber = 1;

      const chatsToExport = chats.slice(0, visibleChats || chats.length);

      const addPageNumber = () => {
        doc.setFontSize(10);
        doc.setTextColor(102, 51, 0);
        doc.text(`Page ${pageNumber}`, 105, 287, { align: "center" });
        doc.setLineWidth(0.8);
        doc.setDrawColor(184, 134, 11);
        doc.line(20, 275, 190, 275);
      };

      addPageNumber();

      for (let index = 0; index < chatsToExport.length; index++) {
        const chat = chatsToExport[index];

        if (currentY > 240) {
          doc.addPage();
          pageNumber++;
          currentY = 20;
          addPageNumber();
        }

        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(139, 0, 0);
        doc.text(`Conversation ${index + 1}:`, 20, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setFont("times", "italic");
        doc.setTextColor(102, 51, 0);
        let dateText = "Date unavailable";
        try {
          const date = new Date(chat.createdAt);
          if (!isNaN(date.getTime())) {
            dateText = `${date.toLocaleDateString()} | ${date.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}`;
          }
        } catch (_) {}
        doc.text(dateText, 20, currentY);
        currentY += 10;

        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.setTextColor(0, 100, 0);
        doc.text("Your Question:", 20, currentY);
        currentY += 7;

        doc.setFont("times", "normal");
        doc.setTextColor(0, 0, 0);
        const userMessage = chat.userMessage || "No question recorded";
        const splitQuestion = doc.splitTextToSize(userMessage, 160);
        doc.text(splitQuestion, 30, currentY);
        currentY += splitQuestion.length * 6 + 10;

        if (currentY > 240) {
          doc.addPage();
          pageNumber++;
          currentY = 20;
          addPageNumber();
        }

        doc.setFont("times", "bold");
        doc.setTextColor(139, 69, 19);
        doc.setFontSize(12);
        doc.text("Divine Guidance:", 20, currentY);
        currentY += 7;

        doc.setFont("times", "normal");
        doc.setTextColor(0, 0, 0);
        const botResponse = chat.botResponse || "No response available";
        const splitResponse = doc.splitTextToSize(botResponse, 160);
        doc.text(splitResponse, 30, currentY);
        currentY += splitResponse.length * 6 + 10;

        if (index < chatsToExport.length - 1) {
          doc.setLineWidth(0.5);
          doc.setDrawColor(184, 134, 11);
          doc.line(40, currentY, 170, currentY);
          currentY += 10;
        }

        if (currentY > 240) {
          doc.addPage();
          pageNumber++;
          currentY = 20;
          addPageNumber();
        }
      }

      // Final Footer
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.setTextColor(139, 0, 0);
      doc.text("Generated from Bhagavad Gita Bot", 105, 280, {
        align: "center",
      });

      const today = new Date();
const timestamp = today.toISOString().replace(/[:.]/g, "-");
const fileName = `BhagavadGita_Wisdom_${timestamp}.pdf`;

      if (
        Capacitor.getPlatform() === "android" ||
        Capacitor.getPlatform() === "ios"
      ) {
        const pdfOutput = doc.output("datauristring");
        const base64 = pdfOutput.split(",")[1];
        await Filesystem.requestPermissions({ permissions: ['publicStorage'] });

await Filesystem.writeFile({
  path: fileName,
  data: base64,
  directory: Directory.External, 
});

        // Show success message first
        await Swal.fire({
          icon: "success",
          title: "PDF Saved Successfully!",
          html: `
            <div style="text-align: center; margin-top: 10px;">
              <p style="color: #666; margin-bottom: 15px;">
                Your conversation has been saved to your documents folder.
              </p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #28a745;">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.293 4L10 .707A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 10.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 12a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z"/>
                </svg>
                <small style="font-weight: 500;">Ready to view or share</small>
              </div>
            </div>
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "animate__animated animate__fadeInDown animate__faster",
            icon: "animate__animated animate__bounceIn animate__delay-1s",
          },
        });

        // Show share options after success message
        const result = await Swal.fire({
          icon: "question",
          title: "Share PDF?",
          html: `
            <div style="text-align: center; margin-top: 10px;">
              <p style="color: #666; margin-bottom: 15px;">
                Would you like to share your Bhagavad Gita PDF with others?
              </p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #17a2b8;">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                </svg>
                <small style="font-weight: 500;">Share with friends & family</small>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Share',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d',
          customClass: {
            popup: "animate__animated animate__fadeInUp animate__faster",
            icon: "animate__animated animate__pulse animate__delay-1s",
          },
        });

        // Handle user's choice
        if (result.isConfirmed) {
          try {
            const fileUri = await Filesystem.getUri({
  directory: Directory.External,
  path: fileName,
});

await Share.share({
  title: "Share Bhagavad Gita PDF",
  text: "Here is your exported conversation from Geeta GPT",
  url: fileUri.uri,
  dialogTitle: "Share PDF",
});
          } catch (shareError) {
            console.error("Error sharing PDF:", shareError);
            await Swal.fire({
              icon: "error",
              title: "Share Failed",
              html: `
                <div style="text-align: center; margin-top: 10px;">
                  <p style="color: #666; margin-bottom: 15px;">
                    We couldn't share your PDF at this moment.
                  </p>
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                    <small style="font-weight: 500;">Sharing failed</small>
                  </div>
                  <div style="font-size: 13px; color: #888;">
                    <strong>Your PDF is still saved!</strong><br>
                    You can find it in your documents folder.
                  </div>
                </div>
              `,
              timer: 4000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          }
        }
        // If cancelled, do nothing - PDF is already saved
      } else {
        // For web platform
        doc.save(fileName);
        
        // Show success message for web
        await Swal.fire({
          icon: "success",
          title: "PDF Downloaded!",
          html: `
            <div style="text-align: center; margin-top: 10px;">
              <p style="color: #666; margin-bottom: 15px;">
                Your Bhagavad Gita conversation has been downloaded successfully.
              </p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #28a745;">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                <small style="font-weight: 500;">Check your downloads folder</small>
              </div>
            </div>
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error exporting all chats:", error);
      await Swal.fire({
        icon: "error",
        title: "Export Failed",
        html: `
          <div style="text-align: center; margin-top: 10px;">
            <p style="color: #666; margin-bottom: 15px;">
              We couldn't save your PDF at this moment.
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #dc3545; margin-bottom: 15px;">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <small style="font-weight: 500;">This is usually temporary</small>
            </div>
            <div style="font-size: 13px; color: #888;">
              <strong>What you can try:</strong><br>
              • Check your internet connection<br>
              • Refresh the page and try again<br>
            </div>
          </div>
        `,
      });
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
  <button className={`export-button ${fontSize}`} onClick={handleExportAllChats}>
    <FaBookOpen style={{ marginRight: "8px" }} /> Export All Conversations
  </button>
</div>


    </>
  );
};

export default exportChats;