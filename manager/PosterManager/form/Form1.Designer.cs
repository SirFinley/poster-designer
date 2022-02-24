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
            this.browseButton = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            this.sizeLabel = new System.Windows.Forms.Label();
            this.orientationLabel = new System.Windows.Forms.Label();
            this.paperLabel = new System.Windows.Forms.Label();
            this.borderSizeLabel = new System.Windows.Forms.Label();
            this.borderLabelValue = new System.Windows.Forms.Label();
            this.paperLabelValue = new System.Windows.Forms.Label();
            this.orientationLabelValue = new System.Windows.Forms.Label();
            this.sizeLabelValue = new System.Windows.Forms.Label();
            this.posterIdLabelValue = new System.Windows.Forms.Label();
            this.posterIdSettingLabel = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.previewRender)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.clientThumbnail)).BeginInit();
            this.SuspendLayout();
            // 
            // posterIdInput
            // 
            this.posterIdInput.Location = new System.Drawing.Point(12, 571);
            this.posterIdInput.Name = "posterIdInput";
            this.posterIdInput.Size = new System.Drawing.Size(276, 23);
            this.posterIdInput.TabIndex = 0;
            this.posterIdInput.Text = "5IAKKAG2";
            // 
            // renderButton
            // 
            this.renderButton.Location = new System.Drawing.Point(294, 570);
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
            this.posterIdLabel.Location = new System.Drawing.Point(12, 550);
            this.posterIdLabel.Name = "posterIdLabel";
            this.posterIdLabel.Size = new System.Drawing.Size(53, 15);
            this.posterIdLabel.TabIndex = 2;
            this.posterIdLabel.Text = "Poster Id";
            // 
            // previewRender
            // 
            this.previewRender.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.previewRender.Location = new System.Drawing.Point(466, 321);
            this.previewRender.Name = "previewRender";
            this.previewRender.Size = new System.Drawing.Size(300, 300);
            this.previewRender.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
            this.previewRender.TabIndex = 3;
            this.previewRender.TabStop = false;
            // 
            // renderStatus
            // 
            this.renderStatus.AutoSize = true;
            this.renderStatus.Location = new System.Drawing.Point(12, 597);
            this.renderStatus.Name = "renderStatus";
            this.renderStatus.Size = new System.Drawing.Size(82, 15);
            this.renderStatus.TabIndex = 4;
            this.renderStatus.Text = "Render Status:";
            // 
            // clientThumbnail
            // 
            this.clientThumbnail.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.clientThumbnail.Location = new System.Drawing.Point(466, 15);
            this.clientThumbnail.Name = "clientThumbnail";
            this.clientThumbnail.Size = new System.Drawing.Size(300, 300);
            this.clientThumbnail.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
            this.clientThumbnail.TabIndex = 5;
            this.clientThumbnail.TabStop = false;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(365, 15);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(95, 15);
            this.label1.TabIndex = 6;
            this.label1.Text = "Expected Render";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(365, 321);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(81, 15);
            this.label2.TabIndex = 7;
            this.label2.Text = "Actual Render";
            // 
            // browseButton
            // 
            this.browseButton.Location = new System.Drawing.Point(375, 571);
            this.browseButton.Name = "browseButton";
            this.browseButton.Size = new System.Drawing.Size(75, 23);
            this.browseButton.TabIndex = 8;
            this.browseButton.Text = "Browse";
            this.browseButton.UseVisualStyleBackColor = true;
            this.browseButton.Click += new System.EventHandler(this.browseButton_Click);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Segoe UI", 12F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point);
            this.label3.Location = new System.Drawing.Point(12, 9);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(72, 21);
            this.label3.TabIndex = 9;
            this.label3.Text = "Settings";
            // 
            // sizeLabel
            // 
            this.sizeLabel.AutoSize = true;
            this.sizeLabel.Location = new System.Drawing.Point(57, 80);
            this.sizeLabel.Name = "sizeLabel";
            this.sizeLabel.Size = new System.Drawing.Size(27, 15);
            this.sizeLabel.TabIndex = 10;
            this.sizeLabel.Text = "Size";
            this.sizeLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // orientationLabel
            // 
            this.orientationLabel.AutoSize = true;
            this.orientationLabel.Location = new System.Drawing.Point(17, 110);
            this.orientationLabel.Name = "orientationLabel";
            this.orientationLabel.Size = new System.Drawing.Size(67, 15);
            this.orientationLabel.TabIndex = 11;
            this.orientationLabel.Text = "Orientation";
            this.orientationLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // paperLabel
            // 
            this.paperLabel.AutoSize = true;
            this.paperLabel.Location = new System.Drawing.Point(47, 141);
            this.paperLabel.Name = "paperLabel";
            this.paperLabel.Size = new System.Drawing.Size(37, 15);
            this.paperLabel.TabIndex = 12;
            this.paperLabel.Text = "Paper";
            this.paperLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // borderSizeLabel
            // 
            this.borderSizeLabel.AutoSize = true;
            this.borderSizeLabel.Location = new System.Drawing.Point(19, 177);
            this.borderSizeLabel.Name = "borderSizeLabel";
            this.borderSizeLabel.Size = new System.Drawing.Size(65, 15);
            this.borderSizeLabel.TabIndex = 13;
            this.borderSizeLabel.Text = "Border Size";
            this.borderSizeLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // borderLabelValue
            // 
            this.borderLabelValue.AutoSize = true;
            this.borderLabelValue.Location = new System.Drawing.Point(90, 177);
            this.borderLabelValue.Name = "borderLabelValue";
            this.borderLabelValue.Size = new System.Drawing.Size(29, 15);
            this.borderLabelValue.TabIndex = 17;
            this.borderLabelValue.Text = "N/A";
            this.borderLabelValue.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // paperLabelValue
            // 
            this.paperLabelValue.AutoSize = true;
            this.paperLabelValue.Location = new System.Drawing.Point(90, 141);
            this.paperLabelValue.Name = "paperLabelValue";
            this.paperLabelValue.Size = new System.Drawing.Size(29, 15);
            this.paperLabelValue.TabIndex = 16;
            this.paperLabelValue.Text = "N/A";
            this.paperLabelValue.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // orientationLabelValue
            // 
            this.orientationLabelValue.AutoSize = true;
            this.orientationLabelValue.Location = new System.Drawing.Point(90, 110);
            this.orientationLabelValue.Name = "orientationLabelValue";
            this.orientationLabelValue.Size = new System.Drawing.Size(29, 15);
            this.orientationLabelValue.TabIndex = 15;
            this.orientationLabelValue.Text = "N/A";
            this.orientationLabelValue.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // sizeLabelValue
            // 
            this.sizeLabelValue.AutoSize = true;
            this.sizeLabelValue.Location = new System.Drawing.Point(90, 80);
            this.sizeLabelValue.Name = "sizeLabelValue";
            this.sizeLabelValue.Size = new System.Drawing.Size(29, 15);
            this.sizeLabelValue.TabIndex = 14;
            this.sizeLabelValue.Text = "N/A";
            this.sizeLabelValue.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // posterIdLabelValue
            // 
            this.posterIdLabelValue.AutoSize = true;
            this.posterIdLabelValue.Location = new System.Drawing.Point(90, 54);
            this.posterIdLabelValue.Name = "posterIdLabelValue";
            this.posterIdLabelValue.Size = new System.Drawing.Size(29, 15);
            this.posterIdLabelValue.TabIndex = 19;
            this.posterIdLabelValue.Text = "N/A";
            this.posterIdLabelValue.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // posterIdSettingLabel
            // 
            this.posterIdSettingLabel.AutoSize = true;
            this.posterIdSettingLabel.Location = new System.Drawing.Point(31, 54);
            this.posterIdSettingLabel.Name = "posterIdSettingLabel";
            this.posterIdSettingLabel.Size = new System.Drawing.Size(53, 15);
            this.posterIdSettingLabel.TabIndex = 18;
            this.posterIdSettingLabel.Text = "Poster Id";
            this.posterIdSettingLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(777, 624);
            this.Controls.Add(this.posterIdLabelValue);
            this.Controls.Add(this.posterIdSettingLabel);
            this.Controls.Add(this.borderLabelValue);
            this.Controls.Add(this.paperLabelValue);
            this.Controls.Add(this.orientationLabelValue);
            this.Controls.Add(this.sizeLabelValue);
            this.Controls.Add(this.borderSizeLabel);
            this.Controls.Add(this.paperLabel);
            this.Controls.Add(this.orientationLabel);
            this.Controls.Add(this.sizeLabel);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.browseButton);
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
        private Button browseButton;
        private Label label3;
        private Label sizeLabel;
        private Label orientationLabel;
        private Label paperLabel;
        private Label borderSizeLabel;
        private Label borderLabelValue;
        private Label paperLabelValue;
        private Label orientationLabelValue;
        private Label sizeLabelValue;
        private Label posterIdLabelValue;
        private Label posterIdSettingLabel;
    }
}