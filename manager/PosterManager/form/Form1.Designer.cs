namespace PosterManager
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.posterIdInput = new System.Windows.Forms.TextBox();
            this.renderButton = new System.Windows.Forms.Button();
            this.posterIdLabel = new System.Windows.Forms.Label();
            this.previewRender = new System.Windows.Forms.PictureBox();
            this.renderStatus = new System.Windows.Forms.Label();
            this.clientThumbnail = new System.Windows.Forms.PictureBox();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.previewRender)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.clientThumbnail)).BeginInit();
            this.SuspendLayout();
            // 
            // posterIdInput
            // 
            this.posterIdInput.Location = new System.Drawing.Point(12, 413);
            this.posterIdInput.Name = "posterIdInput";
            this.posterIdInput.Size = new System.Drawing.Size(195, 23);
            this.posterIdInput.TabIndex = 0;
            this.posterIdInput.Text = "5IAKKAG2";
            // 
            // renderButton
            // 
            this.renderButton.Location = new System.Drawing.Point(213, 412);
            this.renderButton.Name = "renderButton";
            this.renderButton.Size = new System.Drawing.Size(75, 23);
            this.renderButton.TabIndex = 1;
            this.renderButton.Text = "Render";
            this.renderButton.UseVisualStyleBackColor = true;
            this.renderButton.Click += new System.EventHandler(this.button1_Click);
            // 
            // posterIdLabel
            // 
            this.posterIdLabel.AutoSize = true;
            this.posterIdLabel.Location = new System.Drawing.Point(12, 392);
            this.posterIdLabel.Name = "posterIdLabel";
            this.posterIdLabel.Size = new System.Drawing.Size(53, 15);
            this.posterIdLabel.TabIndex = 2;
            this.posterIdLabel.Text = "Poster Id";
            // 
            // previewRender
            // 
            this.previewRender.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.previewRender.Location = new System.Drawing.Point(466, 374);
            this.previewRender.Name = "previewRender";
            this.previewRender.Size = new System.Drawing.Size(300, 300);
            this.previewRender.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
            this.previewRender.TabIndex = 3;
            this.previewRender.TabStop = false;
            // 
            // renderStatus
            // 
            this.renderStatus.AutoSize = true;
            this.renderStatus.Location = new System.Drawing.Point(43, 232);
            this.renderStatus.Name = "renderStatus";
            this.renderStatus.Size = new System.Drawing.Size(82, 15);
            this.renderStatus.TabIndex = 4;
            this.renderStatus.Text = "Render Status:";
            // 
            // clientThumbnail
            // 
            this.clientThumbnail.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.clientThumbnail.Location = new System.Drawing.Point(466, 68);
            this.clientThumbnail.Name = "clientThumbnail";
            this.clientThumbnail.Size = new System.Drawing.Size(300, 300);
            this.clientThumbnail.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
            this.clientThumbnail.TabIndex = 5;
            this.clientThumbnail.TabStop = false;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(365, 68);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(95, 15);
            this.label1.TabIndex = 6;
            this.label1.Text = "Expected Render";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(365, 374);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(81, 15);
            this.label2.TabIndex = 7;
            this.label2.Text = "Actual Render";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(889, 717);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.clientThumbnail);
            this.Controls.Add(this.renderStatus);
            this.Controls.Add(this.previewRender);
            this.Controls.Add(this.posterIdLabel);
            this.Controls.Add(this.renderButton);
            this.Controls.Add(this.posterIdInput);
            this.Name = "Form1";
            this.Text = "Form1";
            ((System.ComponentModel.ISupportInitialize)(this.previewRender)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.clientThumbnail)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private TextBox posterIdInput;
        private Button renderButton;
        private Label posterIdLabel;
        private PictureBox previewRender;
        private Label renderStatus;
        private PictureBox clientThumbnail;
        private Label label1;
        private Label label2;
    }
}